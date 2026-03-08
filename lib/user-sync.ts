import { eq } from "drizzle-orm"
import { db } from "@/db/client"
import { users } from "@/db/schema"

interface ClerkUserInfo {
  firstName?: string | null
  lastName?: string | null
  emailAddress?: string | null
}

function buildDisplayName(info: ClerkUserInfo): string {
  const parts = [info.firstName, info.lastName].filter(Boolean)
  if (parts.length > 0) return parts.join(" ")
  if (info.emailAddress) return info.emailAddress.split("@")[0]
  return "Practitioner"
}

export async function ensureUserExists(
  clerkUserId: string,
  clerkUser: ClerkUserInfo
) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1)

  if (existing.length > 0) {
    return existing[0]
  }

  const [created] = await db
    .insert(users)
    .values({
      clerkUserId,
      displayName: buildDisplayName(clerkUser),
      timezone: "UTC",
    })
    .returning()

  return created
}
