/**
 * Warm earth-tone avatar with host initials.
 * Deterministic colour based on name — same person, same colour every time.
 */

const PALETTE_COUNT = 5

function avatarClass(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const idx = (Math.abs(hash) % PALETTE_COUNT) + 1
  return `avatar-warm-${idx}`
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

interface AvatarProps {
  name: string
  size?: "sm" | "md"
}

export function Avatar({ name, size = "md" }: AvatarProps) {
  const sizeClasses = size === "sm"
    ? "h-8 w-8 text-xs"
    : "h-10 w-10 text-sm"

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-medium ${sizeClasses} ${avatarClass(name)}`}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  )
}
