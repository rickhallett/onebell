"use server"

import { revalidatePath } from "next/cache"
import { clerkClient } from "@clerk/nextjs/server"
import { requireUser } from "@/lib/auth"
import { getUserByClerkId, leaveSit } from "@/db/queries"
import { sendGuestLeftEmail } from "@/emails/guest-left"
import { trackEvent } from "@/lib/analytics"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

export async function leaveSitAction(
  sitId: string
): Promise<ActionResult> {
  try {
    const clerkUserId = await requireUser()
    const user = await getUserByClerkId(clerkUserId)
    if (!user) throw new Error("User not found")

    const { sit, host } = await leaveSit(sitId, user.id)

    revalidatePath("/app")
    revalidatePath("/app/my-sits")
    trackEvent("sit_left", { sitId })

    // Fire-and-forget: email must not block the mutation
    const clerk = await clerkClient()
    clerk.users
      .getUser(host.clerkUserId)
      .then((hostClerk) => {
        const hostEmail = hostClerk.emailAddresses[0]?.emailAddress
        if (hostEmail) {
          return sendGuestLeftEmail({
            hostEmail,
            hostName: host.displayName,
            guestName: user.displayName,
            sitTime: sit.startsAt,
            instruction: sit.instructionText,
          })
        }
      })
      .catch((err) => console.error("[email] leaveSit email failed:", err))

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
