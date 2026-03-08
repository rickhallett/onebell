import { format, formatDistanceToNow } from "date-fns"

/**
 * Format a date as time for display (e.g., "14:30").
 */
export function formatSitTime(date: Date): string {
  return format(date, "HH:mm")
}

/**
 * Format relative time (e.g., "in 5 minutes", "2 hours ago").
 */
export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true })
}
