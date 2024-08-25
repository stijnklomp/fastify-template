import { defineConfig } from "@playwright/test"

export default defineConfig({
	testDir: ".",
	fullyParallel: true,
	forbidOnly: false,
	outputDir: "./reports",
	retries: 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [["junit", { outputFile: "./reports/results.xml" }]],
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		// baseURL: 'http://127.0.0.1:3000',
		trace: "off",
	},
})
