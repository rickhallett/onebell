import Link from "next/link"
import { mySitsAction } from "@/actions/my-sits"

export const dynamic = "force-dynamic"
import {
  HostingSitCard,
  JoinedSitCard,
  PastSitCard,
} from "@/components/my-sit-card"
import { EmptyState } from "@/components/empty-state"

export default async function MySitsPage() {
  const { userId, hosting, joined, past } = await mySitsAction()
  const hasAnySits = hosting.length + joined.length + past.length > 0

  if (!hasAnySits) {
    return (
      <div>
        <div>
          <h1 className="font-serif text-2xl font-medium">My Sits</h1>
          <p className="mt-1 text-sm text-muted">Your practice journal.</p>
        </div>
        <EmptyState
          title="No sits yet."
          description="Create or join a sit to get started."
        >
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
              href="/app"
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border px-5 py-3.5 text-sm font-medium text-foreground transition-all hover:bg-surface hover:shadow-sm"
            >
              Browse the board
            </Link>
          </div>
        </EmptyState>
      </div>
    )
  }

  return (
    <div>
      <div>
        <h1 className="font-serif text-2xl font-medium">My Sits</h1>
        <p className="mt-1 text-sm text-muted">Your practice journal.</p>
      </div>

      {/* Hosting section — warm wash when active */}
      <section className={`mt-8 ${hosting.length > 0 ? "-mx-5 rounded-2xl bg-surface/50 px-5 py-5" : ""}`}>
        <div className="flex items-center gap-2.5">
          {hosting.length > 0 && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-[pulse-slow_3s_ease-in-out_infinite] rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
          )}
          <h2 className="font-serif text-sm font-medium uppercase tracking-widest text-muted">
            Hosting
            {hosting.length > 0 && (
              <span className="ml-1.5 normal-case tracking-normal">
                ({hosting.length})
              </span>
            )}
          </h2>
        </div>
        {hosting.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            You are not hosting any sits.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {hosting.map((sit) => (
              <HostingSitCard key={sit.id} sit={sit} />
            ))}
          </div>
        )}
      </section>

      {/* Decorative divider */}
      <div className="my-8 flex items-center justify-center gap-1.5">
        <span className="h-1 w-1 rounded-full bg-border" />
        <span className="h-1 w-1 rounded-full bg-border" />
        <span className="h-1 w-1 rounded-full bg-border" />
      </div>

      {/* Joined section */}
      <section className={joined.length > 0 ? "-mx-5 rounded-2xl bg-surface/50 px-5 py-5" : ""}>
        <div className="flex items-center gap-2.5">
          {joined.length > 0 && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-[pulse-slow_3s_ease-in-out_infinite] rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
          )}
          <h2 className="font-serif text-sm font-medium uppercase tracking-widest text-muted">
            Joined
            {joined.length > 0 && (
              <span className="ml-1.5 normal-case tracking-normal">
                ({joined.length})
              </span>
            )}
          </h2>
        </div>
        {joined.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            You have not joined any sits.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {joined.map((sit) => (
              <JoinedSitCard key={sit.id} sit={sit} />
            ))}
          </div>
        )}
      </section>

      {/* Decorative divider */}
      <div className="my-8 flex items-center justify-center gap-1.5">
        <span className="h-1 w-1 rounded-full bg-border" />
        <span className="h-1 w-1 rounded-full bg-border" />
        <span className="h-1 w-1 rounded-full bg-border" />
      </div>

      {/* Past section */}
      <section>
        <h2 className="font-serif text-sm font-medium uppercase tracking-widest text-muted">
          Past
          {past.length > 0 && (
            <span className="ml-1.5 normal-case tracking-normal">
              ({past.length})
            </span>
          )}
        </h2>
        {past.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No past sits yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {past.map((sit) => (
              <PastSitCard key={sit.id} sit={sit} currentUserId={userId} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
