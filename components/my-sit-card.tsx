import { formatSitTime } from "@/lib/time"
import { CancelButton } from "@/components/cancel-button"
import { LeaveButton } from "@/components/leave-button"
import type { MySitsResult } from "@/actions/my-sits"

type SitWithNames = MySitsResult["hosting"][number]

interface StatusBadgeProps {
  status: string
}

function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    open: "bg-accent/15 text-accent",
    joined: "bg-accent/25 text-foreground",
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
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-muted">
              {formatSitTime(sit.startsAt)}
            </p>
            <StatusBadge status={sit.status} />
          </div>
          <p className="mt-2 leading-relaxed text-foreground/80">
            {sit.instructionText}
          </p>
          <p className="mt-1 text-sm text-muted">
            {sit.durationMinutes} min
          </p>
          <p className="mt-1 text-sm text-foreground/60">
            {sit.guestDisplayName
              ? `Partner: ${sit.guestDisplayName}`
              : "Waiting for partner"}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <CancelButton sitId={sit.id} />
      </div>
    </div>
  )
}

// -- Joined card ----------------------------------------------------------

interface JoinedCardProps {
  sit: SitWithNames
}

export function JoinedSitCard({ sit }: JoinedCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-muted">
              {formatSitTime(sit.startsAt)}
            </p>
            <StatusBadge status={sit.status} />
          </div>
          <p className="mt-2 leading-relaxed text-foreground/80">
            {sit.instructionText}
          </p>
          <p className="mt-1 text-sm text-muted">
            {sit.durationMinutes} min
          </p>
          <p className="mt-1 text-sm text-foreground/60">
            Host: {sit.hostDisplayName}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {sit.meetingUrl && (
          <a
            href={sit.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent-light"
          >
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
}

export function PastSitCard({ sit }: PastCardProps) {
  const partnerName = sit.guestDisplayName ?? "No partner"

  return (
    <div className="rounded-xl border border-border/60 p-5 opacity-60">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-muted">
          {formatSitTime(sit.startsAt)}
        </p>
        <StatusBadge status={sit.status} />
      </div>
      <p className="mt-2 leading-relaxed text-foreground/70">
        {sit.instructionText}
      </p>
      <p className="mt-1 text-sm text-muted">
        {sit.durationMinutes} min
      </p>
      <p className="mt-1 text-sm text-foreground/60">{partnerName}</p>
    </div>
  )
}
