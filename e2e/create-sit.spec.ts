import { test, expect } from "@playwright/test"

test.describe("Create sit page — authenticated", () => {
  test.skip(
    () => !process.env.E2E_CLERK_USER_ID,
    "E2E_CLERK_USER_ID not set"
  )

  test("shows 'Create a Sit' heading", async ({ page }) => {
    await page.goto("/app/create")
    await expect(
      page.getByRole("heading", { name: "Create a Sit" })
    ).toBeVisible({ timeout: 10000 })
  })

  test("shows Back link to board", async ({ page }) => {
    await page.goto("/app/create")
    await expect(page.getByText("Back")).toBeVisible()
  })

  test("shows mode tabs — Start now and Schedule", async ({ page }) => {
    await page.goto("/app/create")
    await expect(page.getByText("Start now")).toBeVisible({ timeout: 10000 })
    await expect(page.getByText("Schedule")).toBeVisible()
  })

  test("Start now tab is active by default", async ({ page }) => {
    await page.goto("/app/create")
    const startNowTab = page.getByRole("button", { name: "Start now" })
    await expect(startNowTab).toHaveClass(/bg-accent/, { timeout: 10000 })
  })

  test("shows Instruction textarea", async ({ page }) => {
    await page.goto("/app/create")
    await expect(page.getByLabel("Instruction")).toBeVisible({
      timeout: 10000,
    })
  })

  test("shows Meeting link input", async ({ page }) => {
    await page.goto("/app/create")
    await expect(page.getByLabel("Meeting link")).toBeVisible()
  })

  test("shows Duration buttons for all allowed durations", async ({
    page,
  }) => {
    await page.goto("/app/create")
    for (const d of [20, 30, 40, 60]) {
      await expect(
        page.getByRole("button", { name: `${d} min` })
      ).toBeVisible()
    }
  })

  test("40 min is selected by default", async ({ page }) => {
    await page.goto("/app/create")
    const btn40 = page.getByRole("button", { name: "40 min" })
    await expect(btn40).toHaveClass(/bg-accent/, { timeout: 10000 })
  })

  test("shows Note field (optional)", async ({ page }) => {
    await page.goto("/app/create")
    await expect(page.getByLabel(/Note/)).toBeVisible()
  })

  test("shows submit button 'Start a sit now'", async ({ page }) => {
    await page.goto("/app/create")
    await expect(
      page.getByRole("button", { name: "Start a sit now" })
    ).toBeVisible({ timeout: 10000 })
  })

  test("switching to Schedule tab shows additional fields", async ({
    page,
  }) => {
    await page.goto("/app/create")
    await page.getByRole("button", { name: "Schedule" }).click()

    // Scheduled-only fields
    await expect(page.getByLabel("Start time")).toBeVisible()
    await expect(page.getByLabel("Practice type")).toBeVisible()

    // Submit button text changes
    await expect(
      page.getByRole("button", { name: "Schedule sit" })
    ).toBeVisible()
  })

  test("switching back to Start now hides scheduled fields", async ({
    page,
  }) => {
    await page.goto("/app/create")
    await page.getByRole("button", { name: "Schedule" }).click()
    await page.getByRole("button", { name: "Start now" }).click()

    await expect(page.getByLabel("Start time")).not.toBeVisible()
    await expect(
      page.getByRole("button", { name: "Start a sit now" })
    ).toBeVisible()
  })

  test("selecting different durations updates active state", async ({
    page,
  }) => {
    await page.goto("/app/create")
    const btn20 = page.getByRole("button", { name: "20 min" })
    const btn40 = page.getByRole("button", { name: "40 min" })

    await btn20.click()
    await expect(btn20).toHaveClass(/bg-accent/)
    await expect(btn40).not.toHaveClass(/bg-accent/)
  })

  test("Back link navigates to board", async ({ page }) => {
    await page.goto("/app/create")
    await page.getByText("Back").click()
    await page.waitForURL(/\/app$/, { timeout: 10000 })
  })
})
