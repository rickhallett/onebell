type AnalyticsEvent =
  | "user_signed_up"
  | "sit_created"
  | "sit_joined"
  | "sit_left"
  | "sit_cancelled"
  | "sit_completed"

export function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, unknown>
) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[analytics] ${event}`, properties ?? "")
  }
}
