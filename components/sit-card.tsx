import { formatSitTime } from "@/lib/time"
import { isAvailableNow } from "@/lib/sit-utils"
import { JoinButton } from "@/components/join-button"
import type { OpenSit } from "@/actions/list-sits"

interface SitCardProps {
  sit: OpenSit
  currentUserId: string | null
}

export function SitCard({ sit, currentUserId }: SitCardProps) {
  const availableNow = isAvailableNow(sit.startsAt)
  const isHost = currentUserId === sit.hostUserId

  if (!availableNow) {
    // Compact upcoming row
    return (
      <div className="flex items-center justify-between py-4">
        <p className="text-foreground/80">
          <span className="font-medium">{formatSitTime(sit.startsAt)}</span>
          <span className="mx-2 text-muted">&mdash;</span>
          <span>{sit.hostDisplayName}</span>
        </p>
        {!isHost && <JoinButton sitId={sit.id} />}
      </div>
    )
  }

  // Full card for Available Now — pinned note style
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="font-serif text-lg font-medium">{sit.hostDisplayName}</p>
      <p className="mt-1.5 leading-relaxed text-foreground/70">
        {sit.instructionText}
      </p>
      <p className="mt-1.5 text-sm text-muted">
        {sit.durationMinutes} min
      </p>
      {!isHost && (
        <div className="mt-4">
          <JoinButton sitId={sit.id} />
        </div>
      )}
    </div>
  )
}
