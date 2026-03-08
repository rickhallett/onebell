/** Allowed sit durations in minutes. */
export const SIT_DURATIONS = [20, 30, 40, 60] as const

/** Allowed practice types. Extensible later. */
export const PRACTICE_TYPES = ["EI"] as const

/**
 * Returns true if the sit should be displayed in the "Available Now" section.
 * A sit is "available now" if it starts within the next 10 minutes (or has
 * already started but hasn't expired).
 */
export function isAvailableNow(startsAt: Date): boolean {
  const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000)
  return startsAt <= tenMinutesFromNow
}

/**
 * Returns true if a sit has expired.
 * An open sit expires if starts_at is more than 20 minutes in the past.
 */
export function isExpired(startsAt: Date): boolean {
  const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000)
  return startsAt < twentyMinutesAgo
}
