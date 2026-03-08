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
  const { hosting, joined, past } = await mySitsAction()
  const hasAnySits = hosting.length + joined.length + past.length > 0

  if (!hasAnySits) {
    return (
      <div>
        <h1 className="font-serif text-2xl font-medium">My Sits</h1>
        <EmptyState
          title="No sits yet."
          description="Create or join a sit to get started."
        >
          <div className="space-y-3">
            <Link
              href="/app/create"
              className="flex min-h-12 items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-accent-light"
            >
              Start a sit now
            </Link>
            <Link
              href="/app"
              className="flex min-h-12 items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
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
      <h1 className="font-serif text-2xl font-medium">My Sits</h1>

      {/* Hosting section */}
      <section className="mt-8">
        <h2 className="font-serif text-sm font-medium uppercase tracking-widest text-muted">
          Hosting
        </h2>
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

      {/* Joined section */}
      <section className="mt-8">
        <h2 className="font-serif text-sm font-medium uppercase tracking-widest text-muted">
          Joined
        </h2>
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

      {/* Past section */}
      <section className="mt-8">
        <h2 className="font-serif text-sm font-medium uppercase tracking-widest text-muted">
          Past
        </h2>
        {past.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No past sits yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {past.map((sit) => (
              <PastSitCard key={sit.id} sit={sit} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
