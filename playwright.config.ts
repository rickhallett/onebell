import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "smoke",
      use: { ...devices["Desktop Chrome"] },
      grep: /@smoke/,
      // No storageState — smoke tests don't need auth
      // No setup dependency — runs independently
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/host.json" },
      dependencies: ["setup"],
      grepInvert: /@smoke/, // Don't re-run smoke tests in the auth'd project
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], storageState: "e2e/.auth/host.json" },
      dependencies: ["setup"],
      grepInvert: /@smoke/, // Don't re-run smoke tests in the auth'd project
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
