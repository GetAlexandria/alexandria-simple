import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  expect: {
    timeout: 5_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { height: 900, width: 1280 },
      },
    },
  ],
  testDir: "./tests",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4326",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "bun run build && bun run tests/serve-viewer-fixture.ts",
    port: 4326,
    reuseExistingServer: !process.env.CI,
    stderr: "pipe",
    stdout: "pipe",
  },
});
