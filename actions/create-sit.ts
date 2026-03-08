"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import { getUserByClerkId, createSit } from "@/db/queries"
import {
  createAvailableNowSchema,
  createScheduledSitSchema,
  type CreateAvailableNowInput,
  type CreateScheduledSitInput,
} from "@/lib/validation"
import { trackEvent } from "@/lib/analytics"

type ActionResult =
  | { success: true; sitId: string }
  | { success: false; error: string }

export async function createAvailableNowSit(
  input: CreateAvailableNowInput
): Promise<ActionResult> {
  try {
    const clerkUserId = await requireUser()
    const user = await getUserByClerkId(clerkUserId)
    if (!user) throw new Error("User not found")

    const parsed = createAvailableNowSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const startsAt = new Date(Date.now() + 3 * 60 * 1000)

    const sit = await createSit({
      hostUserId: user.id,
      startsAt,
      durationMinutes: parsed.data.durationMinutes,
      practiceType: "EI",
      instructionText: parsed.data.instructionText,
      meetingUrl: parsed.data.meetingUrl,
      note: parsed.data.note ?? null,
    })

    revalidatePath("/app")
    trackEvent("sit_created", { sitId: sit.id, type: "available_now" })

    return { success: true, sitId: sit.id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function createScheduledSit(
  input: CreateScheduledSitInput
): Promise<ActionResult> {
  try {
    const clerkUserId = await requireUser()
    const user = await getUserByClerkId(clerkUserId)
    if (!user) throw new Error("User not found")

    const parsed = createScheduledSitSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const sit = await createSit({
      hostUserId: user.id,
      startsAt: parsed.data.startsAt,
      durationMinutes: parsed.data.durationMinutes,
      practiceType: parsed.data.practiceType,
      instructionText: parsed.data.instructionText,
      meetingUrl: parsed.data.meetingUrl,
      note: parsed.data.note ?? null,
    })

    revalidatePath("/app")
    trackEvent("sit_created", { sitId: sit.id, type: "scheduled" })

    return { success: true, sitId: sit.id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
