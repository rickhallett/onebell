import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { getUserByClerkId, listOpenSits } from "@/db/queries"
import { SitList } from "@/components/sit-list"
import { PollingWrapper } from "@/components/polling-wrapper"
import { EmptyState } from "@/components/empty-state"

export const dynamic = "force-dynamic"

export default async function BoardPage() {
  const { userId: clerkId } = await auth()

  let currentUserId: string | null = null
  if (clerkId) {
    const user = await getUserByClerkId(clerkId)
    currentUserId = user?.id ?? null
  }

  const sits = await listOpenSits()
  const hasSits = sits.length > 0

  return (
    <PollingWrapper>
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight">
          ninebells
        </h1>
        <p className="mt-1 text-sm text-muted">Who&rsquo;s sitting?</p>
      </div>

      {hasSits ? (
        <div className="mt-8">
          <SitList sits={sits} currentUserId={currentUserId} />
        </div>
      ) : (
        <EmptyState
          title="The hall is quiet."
          description="Open a sit and someone may join you."
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
        </EmptyState>
      )}

      {hasSits && (
        <div className="mt-10 space-y-3">
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
      )}
    </PollingWrapper>
  )
}
