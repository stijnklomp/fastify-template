import { mock, beforeEach } from "bun:test"

import * as actualLogger from "@/common/logger"
import { prismaMock } from "@/context"

await mock.module("@/common/logger", () => ({
	...actualLogger,
	logger: {
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
	},
}))

beforeEach(() => {
	prismaMock._reset()
})
