import { z } from "zod"
import { SIT_DURATIONS } from "./sit-utils"

// -- Available Now schema ------------------------------------------------

export const createAvailableNowSchema = z.object({
  instructionText: z
    .string()
    .min(1, "Instruction text is required"),
  meetingUrl: z
    .string()
    .url("Must be a valid URL"),
  note: z.string().optional(),
  durationMinutes: z
    .number()
    .refine(
      (v) => (SIT_DURATIONS as readonly number[]).includes(v),
      { message: `Duration must be one of: ${SIT_DURATIONS.join(", ")}` }
    ),
})

export type CreateAvailableNowInput = z.infer<typeof createAvailableNowSchema>

// -- Scheduled Sit schema ------------------------------------------------

export const createScheduledSitSchema = z.object({
  startsAt: z
    .coerce
    .date()
    .refine((d) => d > new Date(), {
      message: "Start time must be in the future",
    }),
  durationMinutes: z
    .number()
    .refine(
      (v) => (SIT_DURATIONS as readonly number[]).includes(v),
      { message: `Duration must be one of: ${SIT_DURATIONS.join(", ")}` }
    ),
  practiceType: z.string().min(1, "Practice type is required"),
  instructionText: z
    .string()
    .min(1, "Instruction text is required"),
  meetingUrl: z
    .string()
    .url("Must be a valid URL"),
  note: z.string().optional(),
})

export type CreateScheduledSitInput = z.infer<typeof createScheduledSitSchema>

// -- Update Profile schema -----------------------------------------------

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be 100 characters or less"),
  timezone: z.string().min(1, "Timezone is required"),
  bio: z.string().optional(),
  openToBeginners: z.boolean().optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
