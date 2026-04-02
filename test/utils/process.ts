import { mock } from "bun:test"

import { start } from "@/src/app"

export const startApp = async (
	overrideOptions: Parameters<typeof start>[0] = {
		writeOpenapi: false,
	},
) => start(overrideOptions)

/**
 * Give any asynchronous handlers a tick to run.
 */
export const runAsyncHandlers = async () => new Promise((r) => setImmediate(r))

let originalProcessExit: typeof process.exit

export const processExitMock = () => {
	originalProcessExit = process.exit.bind(process)
	const exitMock = mock() as unknown as typeof mock<typeof process.exit>
	process.exit = exitMock as never

	return exitMock
}

/**
 * @remarks Called after `mockProcessExit`.
 */
export const restoreProcessExitMock = () => {
	process.exit = originalProcessExit
}

const originalEnv = { ...process.env }

export const restoreEnvVars = () => (process.env = originalEnv)
