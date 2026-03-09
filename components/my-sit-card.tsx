import { formatSitTime, formatRelativeTime } from "@/lib/time"
import { CancelButton } from "@/components/cancel-button"
import { LeaveButton } from "@/components/leave-button"
import { Avatar } from "@/components/avatar"
import type { MySitsResult } from "@/actions/my-sits"

type SitWithNames = MySitsResult["hosting"][number]

interface StatusBadgeProps {
  status: string
}

function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    open: "bg-accent/15 text-accent",
    joined: "bg-success/15 text-success",
    completed: "bg-border text-muted",
    cancelled: "bg-error/15 text-error",
    expired: "bg-border text-muted",
  }

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? styles.completed}`}
    >
      {status}
    </span>
  )
}

// -- Hosting card ---------------------------------------------------------

interface HostingCardProps {
  sit: SitWithNames
}

export function HostingSitCard({ sit }: HostingCardProps) {
  const isFuture = sit.startsAt > new Date()

  return (
    <div className="card-lift rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-3.5">
        <Avatar
          name={sit.guestDisplayName ?? sit.hostDisplayName}
          size="sm"
        />
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-muted">
              {formatSitTime(sit.startsAt)}
            </p>
            {isFuture && (
              <span className="text-xs text-foreground/40">
                {formatRelativeTime(sit.startsAt)}
              </span>
            )}
            <StatusBadge status={sit.status} />
          </div>
        </div>
      </div>

      <div className="mt-3 border-l-2 border-accent/30 pl-4">
        <p className="font-serif text-sm italic leading-relaxed text-foreground/70">
          &ldquo;{sit.instructionText}&rdquo;
        </p>
      </div>

      <div className="mt-2.5 flex items-center gap-2 text-xs text-muted">
        <span>{sit.durationMinutes} min</span>
        <span className="text-border">&middot;</span>
        <span>
          {sit.guestDisplayName
            ? `Partner: ${sit.guestDisplayName}`
            : "Waiting for partner"}
        </span>
      </div>

      {(sit.status === "open" || sit.status === "joined") && (
        <div className="mt-4">
          <CancelButton sitId={sit.id} />
        </div>
      )}
    </div>
  )
}

// -- Joined card ----------------------------------------------------------

interface JoinedCardProps {
  sit: SitWithNames
}

export function JoinedSitCard({ sit }: JoinedCardProps) {
  const isFuture = sit.startsAt > new Date()

  return (
    <div className="card-lift rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-3.5">
        <Avatar name={sit.hostDisplayName} size="sm" />
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-muted">
              {formatSitTime(sit.startsAt)}
            </p>
            {isFuture && (
              <span className="text-xs text-foreground/40">
                {formatRelativeTime(sit.startsAt)}
              </span>
            )}
            <StatusBadge status={sit.status} />
          </div>
        </div>
      </div>

      <div className="mt-3 border-l-2 border-accent/30 pl-4">
        <p className="font-serif text-sm italic leading-relaxed text-foreground/70">
          &ldquo;{sit.instructionText}&rdquo;
        </p>
      </div>

      <div className="mt-2.5 flex items-center gap-2 text-xs text-muted">
        <span>{sit.durationMinutes} min</span>
        <span className="text-border">&middot;</span>
        <span>Host: {sit.hostDisplayName}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {sit.meetingUrl && (
          <a
            href={sit.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-background shadow-sm transition-all hover:bg-accent-light hover:shadow-md"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Open Meeting
          </a>
        )}
        <LeaveButton sitId={sit.id} />
      </div>
    </div>
  )
}

// -- Past card ------------------------------------------------------------

interface PastCardProps {
  sit: SitWithNames
  currentUserId?: string | null
}

export function PastSitCard({ sit, currentUserId }: PastCardProps) {
  // Show the partner's name/avatar, not your own
  const isHost = currentUserId === sit.hostUserId
  const partnerName = isHost
    ? (sit.guestDisplayName ?? "No partner")
    : sit.hostDisplayName
  const displayName = isHost
    ? (sit.guestDisplayName ?? sit.hostDisplayName)
    : sit.hostDisplayName

  return (
    <div className="rounded-xl border border-border/40 p-5 opacity-60">
      <div className="flex items-center gap-3.5">
        <Avatar name={displayName} size="sm" />
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-muted">
            {formatSitTime(sit.startsAt)}
          </p>
          <StatusBadge status={sit.status} />
        </div>
      </div>

      <div className="mt-3 border-l-2 border-border/30 pl-4">
        <p className="font-serif text-sm italic leading-relaxed text-foreground/70">
          &ldquo;{sit.instructionText}&rdquo;
        </p>
      </div>

      <div className="mt-2.5 flex items-center gap-2 text-xs text-muted">
        <span>{sit.durationMinutes} min</span>
        <span className="text-border">&middot;</span>
        <span>{partnerName}</span>
      </div>
    </div>
  )
}
