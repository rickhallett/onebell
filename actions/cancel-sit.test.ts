import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn().mockResolvedValue({
    users: {
      getUser: vi.fn().mockResolvedValue({
        emailAddresses: [{ emailAddress: "guest@example.com" }],
      }),
    },
  }),
}))
vi.mock("@/lib/auth", () => ({ requireUser: vi.fn() }))
vi.mock("@/db/queries", () => ({ getUserByClerkId: vi.fn(), cancelSit: vi.fn() }))
vi.mock("@/emails/sit-cancelled", () => ({ sendSitCancelledEmail: vi.fn().mockResolvedValue(undefined) }))
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }))

import { cancelSitAction } from "./cancel-sit"
import { requireUser } from "@/lib/auth"
import { getUserByClerkId, cancelSit } from "@/db/queries"
import { trackEvent } from "@/lib/analytics"

const mockRequireUser = vi.mocked(requireUser)
const mockGetUser = vi.mocked(getUserByClerkId)
const mockCancelSit = vi.mocked(cancelSit)
const mockTrackEvent = vi.mocked(trackEvent)

const fakeUser = {
  id: "host-id", clerkUserId: "clerk-host", displayName: "Richard",
  timezone: "Europe/London", bio: null, openToBeginners: true,
  createdAt: new Date(), updatedAt: null,
}
const fakeGuest = {
  id: "guest-id", clerkUserId: "clerk-guest", displayName: "Maya",
  timezone: "America/New_York", bio: null, openToBeginners: true,
  createdAt: new Date(), updatedAt: null,
}
const fakeSit = {
  id: "sit-1", hostUserId: "host-id", guestUserId: null,
  startsAt: new Date(), durationMinutes: 40, practiceType: "EI",
  instructionText: "Who am I?", meetingUrl: "https://meet.test/r",
  note: null, status: "cancelled", createdAt: new Date(), updatedAt: new Date(),
  cancelledAt: new Date(),
}

describe("cancelSitAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireUser.mockResolvedValue("clerk-host")
    mockGetUser.mockResolvedValue(fakeUser)
    mockCancelSit.mockResolvedValue({ sit: fakeSit, guest: null })
  })

  it("cancels a sit with no guest and returns success", async () => {
    const result = await cancelSitAction("sit-1")
    expect(result).toEqual({ success: true })
    expect(mockCancelSit).toHaveBeenCalledWith("sit-1", "host-id")
  })

  it("cancels a sit with a guest and returns success", async () => {
    mockCancelSit.mockResolvedValue({ sit: fakeSit, guest: fakeGuest })
    const result = await cancelSitAction("sit-1")
    expect(result).toEqual({ success: true })
  })

  it("tracks sit_cancelled event", async () => {
    await cancelSitAction("sit-1")
    expect(mockTrackEvent).toHaveBeenCalledWith("sit_cancelled", { sitId: "sit-1" })
  })

  it("returns error when not the host", async () => {
    mockCancelSit.mockRejectedValue(new Error("Only the host can cancel a sit"))
    const result = await cancelSitAction("sit-1")
    expect(result).toEqual({ success: false, error: "Only the host can cancel a sit" })
  })

  it("returns error when already cancelled", async () => {
    mockCancelSit.mockRejectedValue(new Error("Sit is already cancelled"))
    const result = await cancelSitAction("sit-1")
    expect(result).toEqual({ success: false, error: "Sit is already cancelled" })
  })

  it("returns error when user not found", async () => {
    mockGetUser.mockResolvedValue(undefined)
    const result = await cancelSitAction("sit-1")
    expect(result).toEqual({ success: false, error: "User not found" })
  })

  it("returns error when auth fails", async () => {
    mockRequireUser.mockRejectedValue(new Error("Unauthorized"))
    const result = await cancelSitAction("sit-1")
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })
})
