import { test as setup, expect } from "@playwright/test"
import { clerkSetup, clerk } from "@clerk/testing/playwright"

setup.beforeAll(async () => {
  await clerkSetup()
})

const HOST_EMAIL = "rickhallett@live.co.uk"
const GUEST_EMAIL = "rickhallett@icloud.com"

setup("authenticate host", async ({ page }) => {
  await page.goto("/")
  await clerk.signIn({ page, emailAddress: HOST_EMAIL })
  await page.goto("/app")
  await expect(page.getByRole("heading", { name: "onebell" })).toBeVisible({ timeout: 10000 })
  await page.context().storageState({ path: "e2e/.auth/host.json" })
})

setup("authenticate guest", async ({ page }) => {
  await page.goto("/")
  await clerk.signIn({ page, emailAddress: GUEST_EMAIL })
  await page.goto("/app")
  await expect(page.getByRole("heading", { name: "onebell" })).toBeVisible({ timeout: 10000 })
  await page.context().storageState({ path: "e2e/.auth/guest.json" })
})
