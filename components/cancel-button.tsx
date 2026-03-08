"use client"

import { useState } from "react"
import { cancelSitAction } from "@/actions/cancel-sit"

export function CancelButton({ sitId }: { sitId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCancel() {
    if (!confirm("Cancel this sit? This cannot be undone.")) return

    setLoading(true)
    setError(null)
    try {
      const result = await cancelSitAction(sitId)
      if (!result.success) {
        setError(result.error)
      }
    } catch {
      setError("Failed to cancel sit")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleCancel}
        disabled={loading}
        className="min-h-11 rounded-lg border border-error/30 px-4 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/10 disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-error border-t-transparent" />
            Cancelling
          </span>
        ) : (
          "Cancel Sit"
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
