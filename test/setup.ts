import { config } from "dotenv"
import { mock } from "bun:test"

import * as actualLogger from "@/common/logger"

config({ path: ".env.tests" })

export const loggerMocks = {
	debug: mock((msg) => {
		if (process.env.SHOW_LOGS) {
			// eslint-disable-next-line no-console
			console.log(msg)
		}
	}),
	error: mock((msg) => {
		if (process.env.SHOW_LOGS) {
			// eslint-disable-next-line no-console
			console.log(msg)
		}
	}),
	info: mock((msg) => {
		if (process.env.SHOW_LOGS) {
			// eslint-disable-next-line no-console
			console.log(msg)
		}
	}),
	warn: mock((msg) => {
		if (process.env.SHOW_LOGS) {
			// eslint-disable-next-line no-console
			console.log(msg)
		}
	}),
}

await mock.module("@/common/logger", () => ({
	...actualLogger,
	logger: {
		debug: loggerMocks.debug,
		error: loggerMocks.error,
		info: loggerMocks.info,
		warn: loggerMocks.warn,
	},
}))
