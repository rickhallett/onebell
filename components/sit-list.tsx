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
      {/* Available Now */}
      <section>
        <h2 className="font-serif text-sm font-medium uppercase tracking-widest text-muted">
          Available Now
        </h2>
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

      {/* Divider */}
      <hr className="my-8 border-border" />

      {/* Upcoming */}
      <section>
        <h2 className="font-serif text-sm font-medium uppercase tracking-widest text-muted">
          Upcoming
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
