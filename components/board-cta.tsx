import Link from "next/link"

/**
 * Shared CTA buttons for the board page.
 * Used in both empty state and below the sit list.
 */
export function BoardCTA() {
  return (
    <div className="space-y-3">
      <Link
        href="/app/create"
        className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-medium text-background shadow-sm transition-all hover:bg-accent-light hover:shadow-md"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
        Start a sit now
      </Link>
      <Link
        href="/app/create"
        className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border px-5 py-3.5 text-sm font-medium text-foreground transition-all hover:bg-surface hover:shadow-sm"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        Schedule a sit
      </Link>
    </div>
  )
}
