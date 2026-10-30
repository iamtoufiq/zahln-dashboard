import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  use: { baseURL: process.env.DASHBOARD_URL ?? "http://localhost:5173" },
  webServer: process.env.DASHBOARD_URL
    ? undefined
    : {
        command: "npm run build && npx vite preview --port 5173 --strictPort",
        port: 5173,
        reuseExistingServer: true,
      },
});
