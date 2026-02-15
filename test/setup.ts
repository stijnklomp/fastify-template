import { mock, beforeEach } from "bun:test"

import * as actualLogger from "@/common/logger"
import { prismaMock } from "@/context"

await mock.module("@/common/logger", () => ({
	...actualLogger,
	logger: {
		debug: mock((err) => {
			// eslint-disable-next-line no-console
			console.log(err)
		}),
		error: mock((err) => {
			// eslint-disable-next-line no-console
			console.log(err)
		}),
		info: mock((err) => {
			// eslint-disable-next-line no-console
			console.log(err)
		}),
		warn: mock((err) => {
			// eslint-disable-next-line no-console
			console.log(err)
		}),
	},
}))

beforeEach(() => {
	prismaMock._reset()
})
