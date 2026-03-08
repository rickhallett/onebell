"use server"

import { revalidatePath } from "next/cache"
import { clerkClient } from "@clerk/nextjs/server"
import { requireUser } from "@/lib/auth"
import { getUserByClerkId, cancelSit } from "@/db/queries"
import { sendSitCancelledEmail } from "@/emails/sit-cancelled"
import { trackEvent } from "@/lib/analytics"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

export async function cancelSitAction(
  sitId: string
): Promise<ActionResult> {
  try {
    const clerkUserId = await requireUser()
    const user = await getUserByClerkId(clerkUserId)
    if (!user) throw new Error("User not found")

    const { sit, guest } = await cancelSit(sitId, user.id)

    revalidatePath("/app")
    revalidatePath("/app/my-sits")
    trackEvent("sit_cancelled", { sitId })

    // Fire-and-forget: only email guest if one exists
    if (guest) {
      const clerk = await clerkClient()
      clerk.users
        .getUser(guest.clerkUserId)
        .then((guestClerk) => {
          const guestEmail = guestClerk.emailAddresses[0]?.emailAddress
          if (guestEmail) {
            return sendSitCancelledEmail({
              guestEmail,
              guestName: guest.displayName,
              hostName: user.displayName,
              sitTime: sit.startsAt,
              instruction: sit.instructionText,
            })
          }
        })
        .catch((err) => console.error("[email] cancelSit email failed:", err))
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
