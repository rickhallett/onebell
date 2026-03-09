import { describe, it, expect, vi, afterEach } from "vitest"
import {
  createAvailableNowSchema,
  createScheduledSitSchema,
  updateProfileSchema,
} from "./validation"

describe("createAvailableNowSchema", () => {
  const validInput = {
    instructionText: "Who am I?",
    meetingUrl: "https://meet.example.com/room",
    durationMinutes: 40,
  }

  it("accepts valid input", () => {
    const result = createAvailableNowSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it("accepts valid input with optional note", () => {
    const result = createAvailableNowSchema.safeParse({
      ...validInput,
      note: "Beginners welcome",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty instruction text", () => {
    const result = createAvailableNowSchema.safeParse({
      ...validInput,
      instructionText: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid URL", () => {
    const result = createAvailableNowSchema.safeParse({
      ...validInput,
      meetingUrl: "not-a-url",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid duration", () => {
    const result = createAvailableNowSchema.safeParse({
      ...validInput,
      durationMinutes: 25,
    })
    expect(result.success).toBe(false)
  })

  it("accepts all valid durations", () => {
    for (const d of [20, 30, 40, 60]) {
      const result = createAvailableNowSchema.safeParse({
        ...validInput,
        durationMinutes: d,
      })
      expect(result.success).toBe(true)
    }
  })

  it("rejects missing fields", () => {
    const result = createAvailableNowSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("rejects non-HTTPS meeting URL", () => {
    const result = createAvailableNowSchema.safeParse({
      ...validInput,
      meetingUrl: "http://meet.example.com/room",
    })
    expect(result.success).toBe(false)
  })

  it("rejects javascript: URI as meeting URL", () => {
    const result = createAvailableNowSchema.safeParse({
      ...validInput,
      meetingUrl: "javascript:alert(1)",
    })
    expect(result.success).toBe(false)
  })

  it("rejects instruction text over 500 chars", () => {
    const result = createAvailableNowSchema.safeParse({
      ...validInput,
      instructionText: "A".repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it("rejects note over 200 chars", () => {
    const result = createAvailableNowSchema.safeParse({
      ...validInput,
      note: "A".repeat(201),
    })
    expect(result.success).toBe(false)
  })
})

describe("createScheduledSitSchema", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function futureInput() {
    return {
      startsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      durationMinutes: 40,
      practiceType: "EI",
      instructionText: "What is here right now?",
      meetingUrl: "https://zoom.us/j/test",
    }
  }

  it("accepts valid future sit", () => {
    const result = createScheduledSitSchema.safeParse(futureInput())
    expect(result.success).toBe(true)
  })

  it("rejects start time in the past", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-03-08T12:00:00Z"))
    const result = createScheduledSitSchema.safeParse({
      ...futureInput(),
      startsAt: "2026-03-08T11:00:00Z",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty practice type", () => {
    const result = createScheduledSitSchema.safeParse({
      ...futureInput(),
      practiceType: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid duration", () => {
    const result = createScheduledSitSchema.safeParse({
      ...futureInput(),
      durationMinutes: 45,
    })
    expect(result.success).toBe(false)
  })

  it("coerces string date to Date object", () => {
    const result = createScheduledSitSchema.safeParse(futureInput())
    if (result.success) {
      expect(result.data.startsAt).toBeInstanceOf(Date)
    }
  })
})

describe("updateProfileSchema", () => {
  const validInput = {
    displayName: "Richard",
    timezone: "Europe/London",
  }

  it("accepts valid input", () => {
    const result = updateProfileSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it("accepts input with optional bio and openToBeginners", () => {
    const result = updateProfileSchema.safeParse({
      ...validInput,
      bio: "Long-time practitioner",
      openToBeginners: true,
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty display name", () => {
    const result = updateProfileSchema.safeParse({
      ...validInput,
      displayName: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects display name over 100 chars", () => {
    const result = updateProfileSchema.safeParse({
      ...validInput,
      displayName: "A".repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it("accepts display name of exactly 100 chars", () => {
    const result = updateProfileSchema.safeParse({
      ...validInput,
      displayName: "A".repeat(100),
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty timezone", () => {
    const result = updateProfileSchema.safeParse({
      ...validInput,
      timezone: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects bio over 500 chars", () => {
    const result = updateProfileSchema.safeParse({
      ...validInput,
      bio: "A".repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it("accepts bio of exactly 500 chars", () => {
    const result = updateProfileSchema.safeParse({
      ...validInput,
      bio: "A".repeat(500),
    })
    expect(result.success).toBe(true)
  })
})
