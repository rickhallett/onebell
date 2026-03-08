import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/db/queries"
import { listSitsAction } from "@/actions/list-sits"
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

  const sits = await listSitsAction()
  const hasSits = sits.length > 0

  return (
    <PollingWrapper>
      <h1 className="font-serif text-3xl font-medium tracking-tight">
        ninebells
      </h1>

      {hasSits ? (
        <div className="mt-8">
          <SitList sits={sits} currentUserId={currentUserId} />
        </div>
      ) : (
        <EmptyState
          title="No sits right now."
          description="Be the first to open one."
        >
          <div className="space-y-3">
            <Link
              href="/app/create"
              className="flex min-h-12 items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-accent-light"
            >
              Start a sit now
            </Link>
            <Link
              href="/app/create"
              className="flex min-h-12 items-center justify-center rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
            >
              Schedule a sit
            </Link>
          </div>
        </EmptyState>
      )}

      {hasSits && (
        <div className="mt-10 space-y-3">
          <Link
            href="/app/create"
            className="flex min-h-12 items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-accent-light"
          >
            Start a sit now
          </Link>
          <Link
            href="/app/create"
            className="flex min-h-12 items-center justify-center rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            Schedule a sit
          </Link>
        </div>
      )}
    </PollingWrapper>
  )
}
