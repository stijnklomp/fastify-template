import { jest, mock } from "bun:test"
import * as actualLogger from "@/common/logger"

mock.module("@/common/logger", () => ({
	...actualLogger,
	logger: {
		debug: jest.fn(),
		error: jest.fn(),
		info: jest.fn(),
		warn: jest.fn(),
	},
}))
