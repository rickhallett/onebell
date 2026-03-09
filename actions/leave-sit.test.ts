import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn().mockResolvedValue({
    users: {
      getUser: vi.fn().mockResolvedValue({
        emailAddresses: [{ emailAddress: "host@example.com" }],
      }),
    },
  }),
}))
vi.mock("@/lib/auth", () => ({ requireUser: vi.fn() }))
vi.mock("@/db/queries", () => ({ getUserByClerkId: vi.fn(), leaveSit: vi.fn() }))
vi.mock("@/emails/guest-left", () => ({ sendGuestLeftEmail: vi.fn().mockResolvedValue(undefined) }))
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }))

import { leaveSitAction } from "./leave-sit"
import { requireUser } from "@/lib/auth"
import { getUserByClerkId, leaveSit } from "@/db/queries"
import { trackEvent } from "@/lib/analytics"

const mockRequireUser = vi.mocked(requireUser)
const mockGetUser = vi.mocked(getUserByClerkId)
const mockLeaveSit = vi.mocked(leaveSit)
const mockTrackEvent = vi.mocked(trackEvent)

const fakeUser = {
  id: "guest-id", clerkUserId: "clerk-guest", displayName: "Maya",
  timezone: "America/New_York", bio: null, openToBeginners: true,
  createdAt: new Date(), updatedAt: null,
}
const fakeHost = {
  id: "host-id", clerkUserId: "clerk-host", displayName: "Richard",
  timezone: "Europe/London", bio: null, openToBeginners: true,
  createdAt: new Date(), updatedAt: null,
}
const fakeSit = {
  id: "sit-1", hostUserId: "host-id", guestUserId: null,
  startsAt: new Date(), durationMinutes: 40, practiceType: "EI",
  instructionText: "Who am I?", meetingUrl: "https://meet.test/r",
  note: null, status: "open", createdAt: new Date(), updatedAt: new Date(),
  cancelledAt: null,
}

describe("leaveSitAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireUser.mockResolvedValue("clerk-guest")
    mockGetUser.mockResolvedValue(fakeUser)
    mockLeaveSit.mockResolvedValue({ sit: fakeSit, host: fakeHost })
  })

  it("leaves a sit and returns success", async () => {
    const result = await leaveSitAction("sit-1")
    expect(result).toEqual({ success: true })
    expect(mockLeaveSit).toHaveBeenCalledWith("sit-1", "guest-id")
  })

  it("tracks sit_left event", async () => {
    await leaveSitAction("sit-1")
    expect(mockTrackEvent).toHaveBeenCalledWith("sit_left", { sitId: "sit-1" })
  })

  it("returns error when user not found", async () => {
    mockGetUser.mockResolvedValue(undefined)
    const result = await leaveSitAction("sit-1")
    expect(result).toEqual({ success: false, error: "User not found" })
  })

  it("returns error when not the guest", async () => {
    mockLeaveSit.mockRejectedValue(new Error("Only the guest can leave a sit"))
    const result = await leaveSitAction("sit-1")
    expect(result).toEqual({ success: false, error: "Only the guest can leave a sit" })
  })

  it("returns error when auth fails", async () => {
    mockRequireUser.mockRejectedValue(new Error("Unauthorized"))
    const result = await leaveSitAction("sit-1")
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })
})
