"use client"

import { useState } from "react"
import { joinSitAction } from "@/actions/join-sit"

export function JoinButton({ sitId }: { sitId: string }) {
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

  return (
    <div>
      <button
        onClick={handleJoin}
        disabled={loading}
        className="min-h-11 min-w-[100px] rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent-light disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
            Joining
          </span>
        ) : (
          "Join"
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
