import { defineConfig } from "@playwright/test"

export default defineConfig({
	forbidOnly: false,
	fullyParallel: true,
	outputDir: "./reports",
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [["junit", { outputFile: "./reports/results.xml" }]],
	retries: 0,
	testDir: ".",
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		// baseURL: 'http://127.0.0.1:3000',
		trace: "off",
	},
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
})
