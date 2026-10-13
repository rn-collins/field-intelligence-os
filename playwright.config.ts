import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // `exactOptionalPropertyTypes` is on, so omit the key rather than pass undefined.
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: process.env.CI ? ([["html"], ["github"]] as const) : ([["list"]] as const),
  timeout: 30_000,

  use: {
    baseURL,
    trace: "on-first-retry",
  },

  /**
   * Desktop and mobile are both first-class: `docs/standards/UI_STANDARD.md`
   * requires research depth on desktop and one-handed operation on mobile, so
   * accessibility and smoke checks run against both viewports.
   */
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],

  /**
   * Runs against a production build with no `.env` present. This is the check
   * that proves the Phase 00 requirement that Vercel can build and serve the
   * application without any secrets.
   */
  webServer: {
    command: `npm run build && npx next start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
