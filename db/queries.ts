import { eq, and, or, gt, sql, desc, asc } from "drizzle-orm"
import { db } from "./client"
import { users, sits } from "./schema"
import type { User, Sit } from "./schema"

// -- User queries --------------------------------------------------------

export async function getUserByClerkId(
  clerkUserId: string
): Promise<User | undefined> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1)

  return rows[0]
}

export async function upsertUser(data: {
  clerkUserId: string
  displayName: string
  timezone: string
}): Promise<User> {
  const rows = await db
    .insert(users)
    .values({
      clerkUserId: data.clerkUserId,
      displayName: data.displayName,
      timezone: data.timezone,
    })
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: {
        displayName: data.displayName,
        timezone: data.timezone,
        updatedAt: new Date(),
      },
    })
    .returning()

  return rows[0]
}

// -- Sit mutations -------------------------------------------------------

export async function createSit(data: {
  hostUserId: string
  startsAt: Date
  durationMinutes: number
  practiceType: string
  instructionText: string
  meetingUrl: string
  note?: string | null
}): Promise<Sit> {
  const rows = await db
    .insert(sits)
    .values({
      hostUserId: data.hostUserId,
      startsAt: data.startsAt,
      durationMinutes: data.durationMinutes,
      practiceType: data.practiceType,
      instructionText: data.instructionText,
      meetingUrl: data.meetingUrl,
      note: data.note ?? null,
    })
    .returning()

  return rows[0]
}

/**
 * Join a sit using a transaction to prevent race conditions.
 * Verifies the sit is open with no guest before setting guest_user_id.
 * Returns the updated sit with host info for email notification.
 */
export async function joinSit(
  sitId: string,
  userId: string
): Promise<{ sit: Sit; host: User }> {
  return await db.transaction(async (tx) => {
    // Lock and fetch the sit in one query
    const sitRows = await tx
      .select()
      .from(sits)
      .where(eq(sits.id, sitId))
      .for("update")

    const sit = sitRows[0]
    if (!sit) {
      throw new Error("Sit not found")
    }
    if (sit.status !== "open") {
      throw new Error("Sit is not open for joining")
    }
    if (sit.guestUserId !== null) {
      throw new Error("Sit already has a guest")
    }
    if (sit.hostUserId === userId) {
      throw new Error("Host cannot join their own sit")
    }

    const updatedRows = await tx
      .update(sits)
      .set({
        guestUserId: userId,
        status: "joined",
        updatedAt: new Date(),
      })
      .where(eq(sits.id, sitId))
      .returning()

    const hostRows = await tx
      .select()
      .from(users)
      .where(eq(users.id, sit.hostUserId))
      .limit(1)

    if (!hostRows[0]) {
      throw new Error("Host user not found")
    }

    return { sit: updatedRows[0], host: hostRows[0] }
  })
}

/**
 * Leave a sit. Verifies the user is the current guest.
 * Returns the sit with host info for email notification.
 */
export async function leaveSit(
  sitId: string,
  userId: string
): Promise<{ sit: Sit; host: User }> {
  const sitRows = await db
    .select()
    .from(sits)
    .where(eq(sits.id, sitId))
    .limit(1)

  const sit = sitRows[0]
  if (!sit) {
    throw new Error("Sit not found")
  }
  if (sit.guestUserId !== userId) {
    throw new Error("Only the guest can leave a sit")
  }
  if (sit.status !== "joined") {
    throw new Error("Sit is not in joined state")
  }

  const updatedRows = await db
    .update(sits)
    .set({
      guestUserId: null,
      status: "open",
      updatedAt: new Date(),
    })
    .where(eq(sits.id, sitId))
    .returning()

  const hostRows = await db
    .select()
    .from(users)
    .where(eq(users.id, sit.hostUserId))
    .limit(1)

  if (!hostRows[0]) {
    throw new Error("Host user not found")
  }

  return { sit: updatedRows[0], host: hostRows[0] }
}

/**
 * Cancel a sit. Verifies the user is the host.
 * Returns the sit with guest info (if any) for email notification.
 */
export async function cancelSit(
  sitId: string,
  userId: string
): Promise<{ sit: Sit; guest: User | null }> {
  const sitRows = await db
    .select()
    .from(sits)
    .where(eq(sits.id, sitId))
    .limit(1)

  const sit = sitRows[0]
  if (!sit) {
    throw new Error("Sit not found")
  }
  if (sit.hostUserId !== userId) {
    throw new Error("Only the host can cancel a sit")
  }
  if (sit.status === "cancelled") {
    throw new Error("Sit is already cancelled")
  }

  const updatedRows = await db
    .update(sits)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(sits.id, sitId))
    .returning()

  let guest: User | null = null
  if (sit.guestUserId) {
    const guestRows = await db
      .select()
      .from(users)
      .where(eq(users.id, sit.guestUserId))
      .limit(1)
    guest = guestRows[0] ?? null
  }

  return { sit: updatedRows[0], guest }
}

// -- Sit queries ---------------------------------------------------------

/**
 * List open sits that haven't expired (starts_at > now - 20 minutes).
 * Ordered by starts_at ASC. Joins with users for host display_name.
 */
export async function listOpenSits(): Promise<
  (Sit & { hostDisplayName: string })[]
> {
  const twentyMinAgo = sql`now() - interval '20 minutes'`

  const rows = await db
    .select({
      id: sits.id,
      hostUserId: sits.hostUserId,
      guestUserId: sits.guestUserId,
      startsAt: sits.startsAt,
      durationMinutes: sits.durationMinutes,
      practiceType: sits.practiceType,
      instructionText: sits.instructionText,
      meetingUrl: sits.meetingUrl,
      note: sits.note,
      status: sits.status,
      createdAt: sits.createdAt,
      updatedAt: sits.updatedAt,
      cancelledAt: sits.cancelledAt,
      hostDisplayName: users.displayName,
    })
    .from(sits)
    .innerJoin(users, eq(sits.hostUserId, users.id))
    .where(
      and(eq(sits.status, "open"), gt(sits.startsAt, twentyMinAgo))
    )
    .orderBy(asc(sits.startsAt))

  return rows
}

/**
 * Get all sits where the user is host or guest.
 * Ordered by starts_at DESC. Joins with users for partner names.
 */
export async function getUserSits(
  userId: string
): Promise<
  (Sit & { hostDisplayName: string; guestDisplayName: string | null })[]
> {
  // Use raw SQL aliases for the two self-joins on users
  const rows = await db
    .select({
      id: sits.id,
      hostUserId: sits.hostUserId,
      guestUserId: sits.guestUserId,
      startsAt: sits.startsAt,
      durationMinutes: sits.durationMinutes,
      practiceType: sits.practiceType,
      instructionText: sits.instructionText,
      meetingUrl: sits.meetingUrl,
      note: sits.note,
      status: sits.status,
      createdAt: sits.createdAt,
      updatedAt: sits.updatedAt,
      cancelledAt: sits.cancelledAt,
      hostDisplayName: sql<string>`host_u.display_name`,
      guestDisplayName: sql<string | null>`guest_u.display_name`,
    })
    .from(sits)
    .innerJoin(
      sql`${users} as host_u`,
      sql`${sits.hostUserId} = host_u.id`
    )
    .leftJoin(
      sql`${users} as guest_u`,
      sql`${sits.guestUserId} = guest_u.id`
    )
    .where(
      or(
        eq(sits.hostUserId, userId),
        eq(sits.guestUserId, userId)
      )
    )
    .orderBy(desc(sits.startsAt))

  return rows
}
