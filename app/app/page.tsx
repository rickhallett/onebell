import { auth } from "@clerk/nextjs/server"
import { getUserByClerkId, listOpenSits } from "@/db/queries"
import { SitList } from "@/components/sit-list"
import { PollingWrapper } from "@/components/polling-wrapper"
import { EmptyState } from "@/components/empty-state"
import { BoardCTA } from "@/components/board-cta"

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
          onebell
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
          <BoardCTA />
        </EmptyState>
      )}

      {hasSits && (
        <div className="mt-10">
          <BoardCTA />
        </div>
      )}
    </PollingWrapper>
  )
}
