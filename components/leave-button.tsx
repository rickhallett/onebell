"use client"

import { useState } from "react"
import { leaveSitAction } from "@/actions/leave-sit"

export function LeaveButton({ sitId }: { sitId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLeave() {
    setLoading(true)
    setError(null)
    try {
      const result = await leaveSitAction(sitId)
      if (!result.success) {
        setError(result.error)
      }
    } catch {
      setError("Failed to leave sit")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleLeave}
        disabled={loading}
        className="min-h-11 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted border-t-transparent" />
            Leaving
          </span>
        ) : (
          "Leave Sit"
        )}
      </button>
      {error && (
        <p className="mt-1.5 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  )
}
