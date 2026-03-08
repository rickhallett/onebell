"use client"

import { useState } from "react"
import { joinSitAction } from "@/actions/join-sit"

interface JoinButtonProps {
  sitId: string
  compact?: boolean
}

export function JoinButton({ sitId, compact }: JoinButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleJoin() {
    setLoading(true)
    setError(null)
    try {
      const result = await joinSitAction(sitId)
      if (!result.success) {
        setError(result.error)
      }
    } catch {
      setError("Failed to join sit")
    } finally {
      setLoading(false)
    }
  }

  const baseClasses = compact
    ? "rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-background transition-colors hover:bg-accent-light disabled:opacity-50"
    : "min-h-11 min-w-[120px] rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-background transition-all hover:bg-accent-light hover:shadow-sm disabled:opacity-50"

  const label = compact ? "Join" : "Sit together"

  return (
    <div>
      <button
        onClick={handleJoin}
        disabled={loading}
        className={baseClasses}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
            {compact ? "\u2026" : "Joining"}
          </span>
        ) : (
          label
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
