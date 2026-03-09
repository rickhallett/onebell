import { test, expect } from "./fixtures"

/**
 * Sit lifecycle — serial E2E flow with two authenticated users.
 *
 * Exercises: create -> board visibility -> join -> my-sits -> leave -> cancel
 * Each test depends on state produced by the previous test.
 */
test.describe.serial("Sit lifecycle", () => {
  /** Unique instruction text shared across all tests in this serial block. */
  let instruction: string

  test("Host creates an Available Now sit (E4)", async ({ hostPage }) => {
    instruction = `E2E test sit ${Date.now()}`

    await hostPage.goto("/app/create")
    await expect(
      hostPage.getByRole("heading", { name: "Create a Sit" })
    ).toBeVisible({ timeout: 10000 })

    // Fill instruction
    await hostPage.getByLabel("Instruction").fill(instruction)

    // Fill meeting link
    await hostPage.getByLabel("Meeting link").fill("https://meet.example.com/e2e-test")

    // 40 min is selected by default — no click needed

    // Submit
    await hostPage.getByRole("button", { name: "Start a sit now" }).click()

    // Wait for redirect away from /app/create (form submits then router.push("/app"))
    await hostPage.waitForURL(/\/app(?!\/create)/, { timeout: 15000 })
  })

  test("Host cannot see join button on own sit (E8)", async ({ hostPage }) => {
    await hostPage.goto("/app")

    // Find the card containing our unique instruction (wrapped in smart quotes)
    const card = hostPage.locator(".card-lift", {
      hasText: instruction,
    })
    await expect(card).toBeVisible({ timeout: 10000 })

    // Host must NOT see "Sit together" on their own sit
    await expect(
      card.getByRole("button", { name: "Sit together" })
    ).toHaveCount(0)
  })

  test("Guest sees the sit on board and joins (E6, E7)", async ({
    guestPage,
  }) => {
    await guestPage.goto("/app")

    // Find the card containing our unique instruction
    const card = guestPage.locator(".card-lift", {
      hasText: instruction,
    })
    await expect(card).toBeVisible({ timeout: 10000 })

    // Guest clicks "Sit together"
    await card.getByRole("button", { name: "Sit together" }).click()

    // After joining, the button disappears (page revalidates and sit status
    // changes to "joined" — no longer listed as open on the board, or the
    // join button is removed). Reload to see the updated board state.
    await guestPage.waitForTimeout(1000)
    await guestPage.reload()

    // The sit should no longer show "Sit together" for the guest
    // (it's now joined — the guest's card moves to My Sits)
    await expect(
      guestPage.locator(".card-lift", { hasText: instruction }).getByRole("button", { name: "Sit together" })
    ).toHaveCount(0, { timeout: 10000 })
  })

  test("Guest sees meeting link in My Sits (E16)", async ({ guestPage }) => {
    await guestPage.goto("/app/my-sits")

    // The "Joined" section should contain our sit
    const joinedSection = guestPage.locator("section", {
      has: guestPage.locator("h2", { hasText: "Joined" }),
    })
    await expect(joinedSection).toBeVisible({ timeout: 10000 })

    const card = joinedSection.locator(".card-lift", {
      hasText: instruction,
    })
    await expect(card).toBeVisible({ timeout: 10000 })

    // Meeting link is rendered as "Open Meeting" anchor
    await expect(
      card.getByRole("link", { name: "Open Meeting" })
    ).toBeVisible({ timeout: 10000 })
  })

  test("Guest leaves the sit (E9)", async ({ guestPage }) => {
    await guestPage.goto("/app/my-sits")

    const joinedSection = guestPage.locator("section", {
      has: guestPage.locator("h2", { hasText: "Joined" }),
    })

    const card = joinedSection.locator(".card-lift", {
      hasText: instruction,
    })
    await expect(card).toBeVisible({ timeout: 10000 })

    // Click "Leave Sit"
    await card.getByRole("button", { name: "Leave Sit" }).click()

    // After leaving, the card should disappear from Joined section
    // (the action calls revalidatePath so the page re-renders)
    await expect(card).toHaveCount(0, { timeout: 10000 })
  })

  test("Host sees sit is back to open after guest leaves", async ({
    hostPage,
  }) => {
    // Reload to pick up revalidated state
    await hostPage.goto("/app")

    const card = hostPage.locator(".card-lift", {
      hasText: instruction,
    })
    await expect(card).toBeVisible({ timeout: 10000 })

    // Host still must NOT see "Sit together" on their own sit
    await expect(
      card.getByRole("button", { name: "Sit together" })
    ).toHaveCount(0)
  })

  test("Host cancels the sit (E10)", async ({ hostPage }) => {
    await hostPage.goto("/app/my-sits")

    const hostingSection = hostPage.locator("section", {
      has: hostPage.locator("h2", { hasText: "Hosting" }),
    })

    const card = hostingSection.locator(".card-lift", {
      hasText: instruction,
    })
    await expect(card).toBeVisible({ timeout: 10000 })

    // Accept the confirm() dialog that CancelButton triggers
    hostPage.on("dialog", (dialog) => dialog.accept())

    // Click "Cancel Sit"
    await card.getByRole("button", { name: "Cancel Sit" }).click()

    // After cancel, the card should disappear from Hosting (revalidatePath
    // re-renders the page and cancelled sits move to Past section).
    // Wait for the page to re-render after revalidation.
    await hostPage.waitForTimeout(1000)
    await hostPage.reload()
    // The card should no longer be in the Hosting section
    await expect(
      hostingSection.locator(".card-lift", { hasText: instruction })
    ).toHaveCount(0, { timeout: 10000 })
  })

  test("Cancelled sit no longer on board", async ({ guestPage }) => {
    await guestPage.goto("/app")

    // The cancelled sit should not appear on the board at all
    // (listOpenSits only returns open/joined sits)
    await expect(
      guestPage.getByText("Available Now")
    ).toBeVisible({ timeout: 10000 })

    await expect(
      guestPage.locator(".card-lift", { hasText: instruction })
    ).toHaveCount(0, { timeout: 10000 })
  })
})
