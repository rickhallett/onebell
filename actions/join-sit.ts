"use server"

import { revalidatePath } from "next/cache"
import { clerkClient } from "@clerk/nextjs/server"
import { requireUser } from "@/lib/auth"
import { getUserByClerkId, joinSit } from "@/db/queries"
import { sendSitJoinedEmails } from "@/emails/sit-joined"
import { trackEvent } from "@/lib/analytics"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

export async function joinSitAction(
  sitId: string
): Promise<ActionResult> {
  try {
    const clerkUserId = await requireUser()
    const user = await getUserByClerkId(clerkUserId)
    if (!user) throw new Error("User not found")

    const { sit, host } = await joinSit(sitId, user.id)

    revalidatePath("/app")
    revalidatePath("/app/my-sits")
    trackEvent("sit_joined", { sitId })

    // Fire-and-forget: email must not block the mutation
    const clerk = await clerkClient()
    Promise.all([
      clerk.users.getUser(host.clerkUserId),
      clerk.users.getUser(clerkUserId),
    ])
      .then(([hostClerk, guestClerk]) => {
        const hostEmail = hostClerk.emailAddresses[0]?.emailAddress
        const guestEmail = guestClerk.emailAddresses[0]?.emailAddress
        if (hostEmail && guestEmail) {
          return sendSitJoinedEmails({
            hostEmail,
            guestEmail,
            hostName: host.displayName,
            guestName: user.displayName,
            sitTime: sit.startsAt,
            instruction: sit.instructionText,
            duration: sit.durationMinutes,
            meetingUrl: sit.meetingUrl,
          })
        }
      })
      .catch((err) => console.error("[email] joinSit email failed:", err))

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
