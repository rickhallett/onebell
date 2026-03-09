import { test, expect } from "@playwright/test"

test.describe("Profile page — authenticated", () => {
  test.skip(
    () => !process.env.E2E_CLERK_USER_ID,
    "E2E_CLERK_USER_ID not set"
  )

  test("shows 'Profile' heading", async ({ page }) => {
    await page.goto("/app/profile")
    await expect(
      page.getByRole("heading", { name: "Profile" })
    ).toBeVisible({ timeout: 10000 })
  })

  test("shows Display Name input with current value", async ({ page }) => {
    await page.goto("/app/profile")
    const input = page.getByLabel("Display Name")
    await expect(input).toBeVisible({ timeout: 10000 })
    // Should have a non-empty value (user exists)
    await expect(input).not.toHaveValue("")
  })

  test("shows Timezone selector", async ({ page }) => {
    await page.goto("/app/profile")
    const select = page.getByLabel("Timezone")
    await expect(select).toBeVisible()
  })

  test("shows Bio textarea", async ({ page }) => {
    await page.goto("/app/profile")
    const bio = page.getByLabel("Bio")
    await expect(bio).toBeVisible()
  })

  test("shows Open to beginners checkbox", async ({ page }) => {
    await page.goto("/app/profile")
    const checkbox = page.getByLabel("Open to beginners")
    await expect(checkbox).toBeVisible()
  })

  test("shows Save Profile button", async ({ page }) => {
    await page.goto("/app/profile")
    await expect(
      page.getByRole("button", { name: "Save Profile" })
    ).toBeVisible()
  })

  test("Profile nav link is active", async ({ page }) => {
    await page.goto("/app/profile")
    const link = page.getByRole("link", { name: "Profile" })
    await expect(link).toHaveClass(/text-accent/)
  })

  test("timezone selector has common timezones", async ({ page }) => {
    await page.goto("/app/profile")
    const select = page.getByLabel("Timezone")
    // Check a few timezones exist as options
    await expect(select.locator("option[value='Europe/London']")).toBeAttached()
    await expect(select.locator("option[value='America/New_York']")).toBeAttached()
    await expect(select.locator("option[value='Asia/Tokyo']")).toBeAttached()
  })

  test("can edit display name", async ({ page }) => {
    await page.goto("/app/profile")
    const input = page.getByLabel("Display Name")
    await input.clear()
    await input.fill("Test Name")
    await expect(input).toHaveValue("Test Name")
  })

  test("can toggle open to beginners", async ({ page }) => {
    await page.goto("/app/profile")
    const checkbox = page.getByLabel("Open to beginners")
    const initialState = await checkbox.isChecked()
    await checkbox.click()
    const newState = await checkbox.isChecked()
    expect(newState).toBe(!initialState)
  })

  test("bio placeholder text is visible when empty", async ({ page }) => {
    await page.goto("/app/profile")
    const bio = page.getByLabel("Bio")
    const value = await bio.inputValue()
    if (!value) {
      await expect(bio).toHaveAttribute("placeholder", /practice/i)
    }
  })
})
