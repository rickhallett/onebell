import { isAvailableNow } from "@/lib/sit-utils"
import { SitCard } from "@/components/sit-card"
import type { OpenSit } from "@/actions/list-sits"

interface SitListProps {
  sits: OpenSit[]
  currentUserId: string | null
}

export function SitList({ sits, currentUserId }: SitListProps) {
  const availableNow = sits.filter((s) => isAvailableNow(s.startsAt))
  const upcoming = sits.filter((s) => !isAvailableNow(s.startsAt))

  return (
    <div>
      {/* Available Now — warm wash background */}
      <section className={
        availableNow.length > 0
          ? "-mx-5 rounded-2xl bg-surface/50 px-5 py-5"
          : ""
      }>
        <div className="flex items-center gap-2.5">
          {availableNow.length > 0 && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-[pulse-slow_3s_ease-in-out_infinite] rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
          )}
          <h2 className="font-serif text-sm font-medium uppercase tracking-widest text-muted">
            Available Now
            {availableNow.length > 0 && (
              <span className="ml-1.5 normal-case tracking-normal">
                ({availableNow.length})
              </span>
            )}
          </h2>
        </div>
        {availableNow.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No one available right now.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {availableNow.map((sit) => (
              <SitCard
                key={sit.id}
                sit={sit}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </section>

      {/* Decorative divider — three dots, zendo style */}
      <div className="my-8 flex items-center justify-center gap-1.5">
        <span className="h-1 w-1 rounded-full bg-border" />
        <span className="h-1 w-1 rounded-full bg-border" />
        <span className="h-1 w-1 rounded-full bg-border" />
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="font-serif text-sm font-medium uppercase tracking-widest text-muted">
          Upcoming
          {upcoming.length > 0 && (
            <span className="ml-1.5 normal-case tracking-normal">
              ({upcoming.length})
            </span>
          )}
        </h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Nothing scheduled yet.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-border/50">
            {upcoming.map((sit) => (
              <SitCard
                key={sit.id}
                sit={sit}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
