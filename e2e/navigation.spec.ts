import { test, expect } from "@playwright/test"

test.describe("@smoke Route smoke tests — no auth required", () => {
  test("landing page responds 200", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.status()).toBe(200)
  })

  test("board route responds without 500", async ({ page }) => {
    const response = await page.goto("/app")
    expect(response?.status()).toBeLessThan(500)
  })

  test("my-sits route responds without 500", async ({ page }) => {
    const response = await page.goto("/app/my-sits")
    expect(response?.status()).toBeLessThan(500)
  })

  test("profile route responds without 500", async ({ page }) => {
    const response = await page.goto("/app/profile")
    expect(response?.status()).toBeLessThan(500)
  })

  test("create route responds without 500", async ({ page }) => {
    const response = await page.goto("/app/create")
    expect(response?.status()).toBeLessThan(500)
  })

  test("non-existent route does not 500", async ({ page }) => {
    const response = await page.goto("/this-does-not-exist")
    // Next.js may render a custom not-found page with 200; the key is it doesn't crash
    expect(response?.status()).toBeLessThan(500)
  })
})

test.describe("@smoke Landing page content", () => {
  test("shows ninebells heading", async ({ page }) => {
    await page.goto("/")
    await expect(
      page.getByRole("heading", { name: "ninebells" })
    ).toBeVisible()
  })

  test("shows tagline about dyad inquiry", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("dyad inquiry")).toBeVisible()
  })

  test("shows Sign in CTA", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Sign in")).toBeVisible()
  })

  test("shows Create account CTA", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Create account")).toBeVisible()
  })

  test("shows the promise line about taps", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Two or three taps")).toBeVisible()
  })

  test("Sign in link navigates to sign-in page", async ({ page }) => {
    await page.goto("/")
    await page.getByText("Sign in").click()
    await page.waitForURL(/sign-in/, { timeout: 10000 })
    expect(page.url()).toContain("sign-in")
  })
})

test.describe("Navigation flow — authenticated", () => {
  test("bottom nav navigates to My Sits", async ({ page }) => {
    await page.goto("/app")
    await page.getByRole("link", { name: "My Sits" }).click()
    await page.waitForURL(/my-sits/, { timeout: 10000 })
    await expect(
      page.getByRole("heading", { name: "My Sits" })
    ).toBeVisible()
  })

  test("bottom nav navigates to Profile", async ({ page }) => {
    await page.goto("/app")
    await page.getByRole("link", { name: "Profile" }).click()
    await page.waitForURL(/profile/, { timeout: 10000 })
    await expect(
      page.getByRole("heading", { name: "Profile" })
    ).toBeVisible()
  })

  test("bottom nav navigates back to Board", async ({ page }) => {
    await page.goto("/app/my-sits")
    await page.getByRole("link", { name: "Board" }).click()
    await page.waitForURL(/\/app$/, { timeout: 10000 })
    await expect(
      page.getByRole("heading", { name: "ninebells" })
    ).toBeVisible()
  })

  test("nav highlights active route correctly", async ({ page }) => {
    await page.goto("/app/my-sits")
    const mySitsLink = page.getByRole("link", { name: "My Sits" })
    await expect(mySitsLink).toHaveClass(/text-accent/)

    const boardLink = page.getByRole("link", { name: "Board" })
    await expect(boardLink).toHaveClass(/text-muted/)
  })
})
