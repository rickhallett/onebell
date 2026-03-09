import { formatSitTime, formatRelativeTime, formatTimezone } from "@/lib/time"
import { isAvailableNow } from "@/lib/sit-utils"
import { JoinButton } from "@/components/join-button"
import { Avatar } from "@/components/avatar"
import type { OpenSit } from "@/actions/list-sits"

interface SitCardProps {
  sit: OpenSit
  currentUserId: string | null
}

export function SitCard({ sit, currentUserId }: SitCardProps) {
  const availableNow = isAvailableNow(sit.startsAt)
  const isAuthenticated = currentUserId !== null
  const isHost = currentUserId === sit.hostUserId
  const canJoin = isAuthenticated && !isHost

  if (!availableNow) {
    // Upcoming row — avatar, time, instruction, relative time
    return (
      <div className="flex items-start gap-3.5 py-4">
        <Avatar name={sit.hostDisplayName} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-foreground/80">
              <span className="font-medium">{sit.hostDisplayName}</span>
              {sit.hostTimezone && (
                <span className="ml-1.5 text-xs text-muted">
                  {formatTimezone(sit.hostTimezone)}
                </span>
              )}
            </p>
            <p className="shrink-0 text-xs text-muted">
              {formatSitTime(sit.startsAt)}
              <span className="ml-1 text-foreground/40">
                &middot; {formatRelativeTime(sit.startsAt)}
              </span>
            </p>
          </div>
          <p className="mt-1 border-l-2 border-accent/30 pl-3 font-serif text-sm italic text-foreground/60">
            {sit.instructionText}
          </p>
          <p className="mt-1 text-xs text-muted">
            {sit.durationMinutes} min
            {sit.hostOpenToBeginners && (
              <span className="ml-2 text-accent/70">
                &middot; open to beginners
              </span>
            )}
          </p>
        </div>
        {canJoin && (
          <div className="shrink-0 self-center">
            <JoinButton sitId={sit.id} compact />
          </div>
        )}
      </div>
    )
  }

  // Full card for Available Now — warm surface, lift on hover
  return (
    <div className="card-lift rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-3.5">
        <Avatar name={sit.hostDisplayName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between">
            <p className="font-serif text-lg font-medium">
              {sit.hostDisplayName}
            </p>
            {sit.hostTimezone && (
              <p className="text-xs text-muted">
                {formatTimezone(sit.hostTimezone)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 border-l-2 border-accent/30 pl-4">
        <p className="font-serif text-base italic leading-relaxed text-foreground/70">
          &ldquo;{sit.instructionText}&rdquo;
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span>{sit.durationMinutes} min</span>
        {sit.hostOpenToBeginners && (
          <>
            <span className="text-border">&middot;</span>
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-accent">
              open to beginners
            </span>
          </>
        )}
      </div>

      {sit.note && (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {sit.note}
        </p>
      )}

      {canJoin && (
        <div className="mt-4">
          <JoinButton sitId={sit.id} />
        </div>
      )}
    </div>
  )
}
