import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("@/lib/auth", () => ({ requireUser: vi.fn() }))
vi.mock("@/db/queries", () => ({ getUserByClerkId: vi.fn(), updateUser: vi.fn() }))

import { updateProfileAction } from "./update-profile"
import { requireUser } from "@/lib/auth"
import { getUserByClerkId, updateUser } from "@/db/queries"

const mockRequireUser = vi.mocked(requireUser)
const mockGetUser = vi.mocked(getUserByClerkId)
const mockUpdateUser = vi.mocked(updateUser)

const fakeUser = {
  id: "user-1", clerkUserId: "clerk-abc", displayName: "Richard",
  timezone: "Europe/London", bio: null, openToBeginners: false,
  createdAt: new Date(), updatedAt: null,
}

describe("updateProfileAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireUser.mockResolvedValue("clerk-abc")
    mockGetUser.mockResolvedValue(fakeUser)
    mockUpdateUser.mockResolvedValue({ ...fakeUser, displayName: "Updated" })
  })

  it("updates profile and returns success", async () => {
    const result = await updateProfileAction({
      displayName: "Updated",
      timezone: "Europe/London",
    })
    expect(result).toEqual({ success: true })
    expect(mockUpdateUser).toHaveBeenCalledWith("user-1", {
      displayName: "Updated",
      timezone: "Europe/London",
      bio: undefined,
      openToBeginners: undefined,
    })
  })

  it("accepts optional bio and openToBeginners", async () => {
    const result = await updateProfileAction({
      displayName: "Richard",
      timezone: "Europe/London",
      bio: "A practitioner",
      openToBeginners: true,
    })
    expect(result).toEqual({ success: true })
    expect(mockUpdateUser).toHaveBeenCalledWith("user-1", {
      displayName: "Richard",
      timezone: "Europe/London",
      bio: "A practitioner",
      openToBeginners: true,
    })
  })

  it("returns validation error for empty display name", async () => {
    const result = await updateProfileAction({
      displayName: "",
      timezone: "Europe/London",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain("required")
    }
  })

  it("returns validation error for empty timezone", async () => {
    const result = await updateProfileAction({
      displayName: "Richard",
      timezone: "",
    })
    expect(result.success).toBe(false)
  })

  it("returns validation error for display name over 100 chars", async () => {
    const result = await updateProfileAction({
      displayName: "A".repeat(101),
      timezone: "Europe/London",
    })
    expect(result.success).toBe(false)
  })

  it("returns validation error for completely invalid input", async () => {
    const result = await updateProfileAction("not an object")
    expect(result.success).toBe(false)
  })

  it("returns error when user not found", async () => {
    mockGetUser.mockResolvedValue(undefined)
    const result = await updateProfileAction({
      displayName: "Richard",
      timezone: "Europe/London",
    })
    expect(result).toEqual({ success: false, error: "User not found" })
  })

  it("returns error when auth fails", async () => {
    mockRequireUser.mockRejectedValue(new Error("Unauthorized"))
    const result = await updateProfileAction({
      displayName: "Richard",
      timezone: "Europe/London",
    })
    expect(result).toEqual({ success: false, error: "Unauthorized" })
  })
})
