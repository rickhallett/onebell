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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create a Sit</h1>
        <Link
          href="/app"
          className="text-sm text-foreground/60 hover:text-foreground"
        >
          Back to board
        </Link>
      </div>

      {/* Mode tabs */}
      <div className="mb-6 flex rounded-lg border border-foreground/10">
          <button
            type="button"
            onClick={() => { setMode("now"); setError(null) }}
            className={`min-h-11 flex-1 rounded-l-lg px-4 py-3 text-sm font-medium transition-colors ${
              mode === "now"
                ? "bg-foreground text-background"
                : "hover:bg-foreground/5"
            }`}
          >
            Start a sit now
          </button>
          <button
            type="button"
            onClick={() => { setMode("scheduled"); setError(null) }}
            className={`min-h-11 flex-1 rounded-r-lg px-4 py-3 text-sm font-medium transition-colors ${
              mode === "scheduled"
                ? "bg-foreground text-background"
                : "hover:bg-foreground/5"
            }`}
        >
          Schedule a sit
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Instruction text */}
        <div>
          <label htmlFor="instructionText" className="mb-1.5 block text-sm font-medium">
            Instruction
          </label>
          <textarea
            id="instructionText"
            required
            rows={3}
            value={instructionText}
            onChange={(e) => setInstructionText(e.target.value)}
            placeholder="e.g. Who am I?"
            className="w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2.5 text-sm placeholder:text-foreground/40 focus:border-foreground/40 focus:outline-none"
          />
        </div>

        {/* Meeting URL */}
        <div>
          <label htmlFor="meetingUrl" className="mb-1.5 block text-sm font-medium">
            Meeting link
          </label>
          <input
            id="meetingUrl"
            type="url"
            required
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            placeholder="https://zoom.us/j/..."
            className="w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2.5 text-sm placeholder:text-foreground/40 focus:border-foreground/40 focus:outline-none"
          />
        </div>

        {/* Duration selector */}
        <div>
          <span className="mb-1.5 block text-sm font-medium">Duration</span>
          <div className="flex gap-2">
            {SIT_DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDurationMinutes(d)}
                className={`min-h-11 flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  durationMinutes === d
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20 hover:border-foreground/40"
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
            {/* Start time */}
            <div>
              <label htmlFor="startTime" className="mb-1.5 block text-sm font-medium">
                Start time
              </label>
              <input
                id="startTime"
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                min={new Date(Date.now() + 60 * 1000).toISOString().slice(0, 16)}
                className="w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2.5 text-sm focus:border-foreground/40 focus:outline-none"
              />
            </div>

            {/* Practice type */}
            <div>
              <label htmlFor="practiceType" className="mb-1.5 block text-sm font-medium">
                Practice type
              </label>
              <select
                id="practiceType"
                value={practiceType}
                onChange={(e) => setPracticeType(e.target.value)}
                className="w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2.5 text-sm focus:border-foreground/40 focus:outline-none"
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
          <label htmlFor="note" className="mb-1.5 block text-sm font-medium">
            Note <span className="font-normal text-foreground/40">(optional)</span>
          </label>
          <input
            id="note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any additional context"
            className="w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2.5 text-sm placeholder:text-foreground/40 focus:border-foreground/40 focus:outline-none"
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="min-h-11 w-full rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
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
