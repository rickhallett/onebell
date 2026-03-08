"use client"

import { useState } from "react"
import { updateProfileAction } from "@/actions/update-profile"

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "America/Mexico_City",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Zurich",
  "Europe/Stockholm",
  "Europe/Moscow",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Seoul",
  "Asia/Bangkok",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Perth",
  "Pacific/Auckland",
  "Pacific/Honolulu",
] as const

interface ProfileFormProps {
  initialData: {
    displayName: string
    timezone: string
    bio: string | null
    openToBeginners: boolean | null
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialData.displayName)
  const [timezone, setTimezone] = useState(initialData.timezone)
  const [bio, setBio] = useState(initialData.bio ?? "")
  const [openToBeginners, setOpenToBeginners] = useState(
    initialData.openToBeginners ?? false
  )
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    try {
      const result = await updateProfileAction({
        displayName,
        timezone,
        bio: bio || undefined,
        openToBeginners,
      })

      if (result.success) {
        setFeedback({ type: "success", message: "Profile updated." })
      } else {
        setFeedback({ type: "error", message: result.error })
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to update profile." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display name */}
      <div>
        <label
          htmlFor="displayName"
          className="block text-sm font-medium text-foreground/70"
        >
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          maxLength={100}
          className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2.5 text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none"
        />
      </div>

      {/* Timezone */}
      <div>
        <label
          htmlFor="timezone"
          className="block text-sm font-medium text-foreground/70"
        >
          Timezone
        </label>
        <select
          id="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2.5 text-foreground focus:border-foreground/50 focus:outline-none"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-foreground/70"
        >
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2.5 text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none"
          placeholder="A bit about your practice..."
        />
      </div>

      {/* Open to beginners */}
      <label
        htmlFor="openToBeginners"
        className="flex min-h-11 cursor-pointer items-center gap-3"
      >
        <input
          id="openToBeginners"
          type="checkbox"
          checked={openToBeginners}
          onChange={(e) => setOpenToBeginners(e.target.checked)}
          className="h-5 w-5 rounded border-foreground/20"
        />
        <span className="text-sm font-medium text-foreground/70">
          Open to beginners
        </span>
      </label>

      {/* Feedback */}
      {feedback && (
        <p
          className={`text-sm ${
            feedback.type === "success"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {feedback.message}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="min-h-11 w-full rounded-md bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            Saving...
          </span>
        ) : (
          "Save Profile"
        )}
      </button>
    </form>
  )
}
