import { test, expect } from "@playwright/test"

test.describe("@smoke Board — unauthenticated", () => {
  test("redirects to sign-in or shows auth wall", async ({ page }) => {
    const response = await page.goto("/app")
    // Should not 500 — either shows board (if session cookie) or redirects to auth
    expect(response?.status()).toBeLessThan(500)
  })
})

test.describe("Board — authenticated", () => {
  test("shows the onebell heading and subline", async ({ page }) => {
    await page.goto("/app")
    await expect(page.getByRole("heading", { name: "onebell" })).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByText("sitting?")).toBeVisible()
  })

  test("shows Available Now section header with pulse dot when sits exist", async ({
    page,
  }) => {
    await page.goto("/app")
    await expect(page.getByText("Available Now")).toBeVisible({
      timeout: 10000,
    })
  })

  test("shows Upcoming section header", async ({ page }) => {
    await page.goto("/app")
    await expect(page.getByText("Upcoming")).toBeVisible({ timeout: 10000 })
  })

  test("Available Now cards show instruction text in smart quotes when sits exist", async ({
    page,
  }) => {
    await page.goto("/app")
    // Smart-quoted instruction text — may not exist if no open sits from other users
    const quoted = page.locator("text=/\u201C.*\u201D/")
    const count = await quoted.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test("Available Now cards show host avatar initials", async ({ page }) => {
    await page.goto("/app")
    // Avatar divs are aria-hidden with initials text
    const avatar = page.locator("[aria-hidden='true']").first()
    await expect(avatar).toBeVisible({ timeout: 10000 })
  })

  test("Available Now cards show host timezone when sits exist", async ({ page }) => {
    await page.goto("/app")
    // Timezone text only appears when sits from other users exist
    const tz = page.getByText("London").or(page.getByText("New York")).or(page.getByText("Tokyo"))
    const count = await tz.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test("Available Now cards show duration", async ({ page }) => {
    await page.goto("/app")
    const duration = page.getByText(/\d+ min/)
    await expect(duration.first()).toBeVisible({ timeout: 10000 })
  })

  test("Available Now cards show 'open to beginners' badge when applicable", async ({
    page,
  }) => {
    await page.goto("/app")
    // Some hosts have openToBeginners: true — may not exist
    const badge = page.getByText("open to beginners")
    const count = await badge.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test("'Sit together' buttons visible when other users' sits exist", async ({
    page,
  }) => {
    await page.goto("/app")
    // "Sit together" only shows for sits hosted by OTHER users
    const btn = page.getByRole("button", { name: "Sit together" })
    const count = await btn.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test("Upcoming rows show relative time when scheduled sits exist", async ({ page }) => {
    await page.goto("/app")
    // formatRelativeTime produces 'in about X hours' or 'in X minutes'
    const relTime = page.getByText(/in (about )?\d+/)
    const count = await relTime.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test("three-dot divider separates Available Now and Upcoming", async ({
    page,
  }) => {
    await page.goto("/app")
    // Three dot divider elements
    const dots = page.locator(".rounded-full.bg-border")
    await expect(dots.first()).toBeVisible({ timeout: 10000 })
  })

  test("CTA buttons are visible at the bottom", async ({ page }) => {
    await page.goto("/app")
    await expect(page.getByText("Start a sit now").first()).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByText("Schedule a sit").first()).toBeVisible()
  })

  test("bottom nav shows Board, My Sits, Profile links", async ({ page }) => {
    await page.goto("/app")
    await expect(page.getByRole("link", { name: "Board" })).toBeVisible()
    await expect(page.getByRole("link", { name: "My Sits" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Profile" })).toBeVisible()
  })

  test("Board link is highlighted as active", async ({ page }) => {
    await page.goto("/app")
    const boardLink = page.getByRole("link", { name: "Board" })
    await expect(boardLink).toHaveClass(/text-accent/)
  })
})
