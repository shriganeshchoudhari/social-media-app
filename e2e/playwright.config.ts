import { defineConfig, devices } from '@playwright/test';

/**
 * ConnectHub – Playwright configuration
 *
 * Run all tests:        npm test
 * Run a single suite:   npm run test:auth
 * Open Playwright UI:   npm run test:ui
 * Debug a test:         npm run test:debug
 *
 * Prerequisites (both must be running before tests start):
 *   Backend:  http://localhost:9090  (spring-boot:run -Dspring-boot.run.profiles=postgres,dev)
 *   Frontend: http://localhost:3000  (npm run dev inside /frontend)
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,      // tests share seed data; run sequentially to avoid races
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 30_000,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL:       'http://localhost:3000',
    screenshot:    'only-on-failure',
    video:         'retain-on-failure',
    trace:         'retain-on-failure',
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
