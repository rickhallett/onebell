"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createAvailableNowSit, createScheduledSit } from "@/actions/create-sit"
import { SIT_DURATIONS, PRACTICE_TYPES } from "@/lib/sit-utils"

type Mode = "now" | "scheduled"

export function CreateSitForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("now")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Shared fields
  const [instructionText, setInstructionText] = useState("")
  const [meetingUrl, setMeetingUrl] = useState("")
  const [durationMinutes, setDurationMinutes] = useState<number>(40)
  const [note, setNote] = useState("")

  // Scheduled-only fields
  const [startTime, setStartTime] = useState("")
  const [practiceType, setPracticeType] = useState<string>(PRACTICE_TYPES[0])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      if (mode === "now") {
        const result = await createAvailableNowSit({
          instructionText,
          meetingUrl,
          durationMinutes,
          note: note || undefined,
        })
        if (!result.success) {
          setError(result.error)
          return
        }
      } else {
        const result = await createScheduledSit({
          startsAt: new Date(startTime),
          durationMinutes,
          practiceType,
          instructionText,
          meetingUrl,
          note: note || undefined,
        })
        if (!result.success) {
          setError(result.error)
          return
        }
      }
      router.push("/app")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium">Create a Sit</h1>
          <p className="mt-1 text-sm text-muted">Open a space for practice.</p>
        </div>
        <Link
          href="/app"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          Back
        </Link>
      </div>

      {/* Mode tabs */}
      <div className="mb-8 flex rounded-xl border border-border bg-surface">
        <button
          type="button"
          onClick={() => { setMode("now"); setError(null) }}
          className={`min-h-12 flex-1 rounded-l-xl px-4 py-3 text-sm font-medium transition-colors ${
            mode === "now"
              ? "bg-accent text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          Start now
        </button>
        <button
          type="button"
          onClick={() => { setMode("scheduled"); setError(null) }}
          className={`min-h-12 flex-1 rounded-r-xl px-4 py-3 text-sm font-medium transition-colors ${
            mode === "scheduled"
              ? "bg-accent text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          Schedule
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Instruction text */}
        <div>
          <label htmlFor="instructionText" className="mb-2 block text-sm font-medium text-foreground/70">
            Instruction
          </label>
          <textarea
            id="instructionText"
            required
            rows={3}
            value={instructionText}
            onChange={(e) => setInstructionText(e.target.value)}
            placeholder="e.g. Who am I?"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        {/* Meeting URL */}
        <div>
          <label htmlFor="meetingUrl" className="mb-2 block text-sm font-medium text-foreground/70">
            Meeting link
          </label>
          <input
            id="meetingUrl"
            type="url"
            required
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            placeholder="https://zoom.us/j/..."
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        {/* Duration selector */}
        <div>
          <span className="mb-2 block text-sm font-medium text-foreground/70">Duration</span>
          <div className="flex gap-2">
            {SIT_DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDurationMinutes(d)}
                className={`min-h-11 flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                  durationMinutes === d
                    ? "border-accent bg-accent text-background"
                    : "border-border text-muted hover:border-accent/50 hover:text-foreground"
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        {/* Scheduled-only fields */}
        {mode === "scheduled" && (
          <>
            <div>
              <label htmlFor="startTime" className="mb-2 block text-sm font-medium text-foreground/70">
                Start time
              </label>
              <input
                id="startTime"
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                min={new Date(Date.now() + 60 * 1000).toISOString().slice(0, 16)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="practiceType" className="mb-2 block text-sm font-medium text-foreground/70">
                Practice type
              </label>
              <select
                id="practiceType"
                value={practiceType}
                onChange={(e) => setPracticeType(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none"
              >
                {PRACTICE_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Note */}
        <div>
          <label htmlFor="note" className="mb-2 block text-sm font-medium text-foreground/70">
            Note <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any additional context"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="min-h-12 w-full rounded-xl bg-accent px-4 py-3 text-sm font-medium text-background shadow-sm transition-all hover:bg-accent-light hover:shadow-md disabled:opacity-50"
        >
          {submitting
            ? "Creating..."
            : mode === "now"
              ? "Start a sit now"
              : "Schedule sit"}
        </button>
      </form>
    </div>
  )
}
