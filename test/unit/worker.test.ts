import { describe, test, afterEach, expect, mock } from "bun:test"

import { loggerMocks } from "../setup"
import { queueClient } from "@/infrastructure/rabbitMQ"

const mockInit = mock<() => Promise<void>>()
const mockPublish = mock<() => Promise<boolean>>()
const mockConsume =
	mock<
		(
			channel: string,
			queue: string,
			bindings: Record<string, string>,
			callback: (
				msg: unknown,
				channel: { ack: () => void; nack: () => void },
			) => void,
		) => Promise<boolean>
	>()

const mockChannel = {
	ack: mock<() => void>(),
	nack: mock<() => void>(),
}

const mockMessage = {
	content: Buffer.from("test task content"),
}

let originalProcessExit: typeof process.exit

const processExitMock = () => {
	originalProcessExit = process.exit.bind(process)
	const exitMock = mock() as unknown as typeof mock<typeof process.exit>
	process.exit = exitMock as never

	return exitMock
}

const restoreProcessExitMock = () => {
	process.exit = originalProcessExit
}

queueClient.init = mockInit
queueClient.consume = mockConsume
queueClient.publish = mockPublish

const loadWorker = async () => {
	const { startWorker } = await import("@/worker/index")

	return startWorker
}

describe("worker", () => {
	afterEach(() => {
		mock.clearAllMocks()
	})

	test("should ack message and skip DLQ when processing succeeds", async () => {
		mockConsume.mockImplementation(
			(_channel, _queue, _bindings, callback) => {
				callback(mockMessage, mockChannel)

				return true
			},
		)

		const startWorker = await loadWorker()
		await startWorker()

		expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage)
		expect(mockPublish).not.toHaveBeenCalled()
	})

	test("should publish to DLQ and ack message when processing fails", async () => {
		mockPublish.mockResolvedValue(true)
		mockConsume.mockImplementation(
			(_channel, _queue, _bindings, callback) => {
				callback({ content: undefined }, mockChannel)

				return true
			},
		)

		const startWorker = await loadWorker()
		await startWorker()
		await new Promise((r) => setTimeout(r, 0))

		expect(mockPublish).toHaveBeenCalledWith(
			"worker",
			"deadLetter",
			"task_queue.failed",
			expect.any(String),
		)

		const calls = mockPublish.mock.calls as [
			string,
			string,
			string,
			string,
		][]
		const dlqBody = JSON.parse(calls[0]?.[3] ?? "{}") as {
			error: string
			errorName: string
			failedAt: string
			originalContent: string
			queueName: string
		}
		expect(dlqBody.error).toMatch(
			/Cannot read properties of undefined|undefined is not an object/,
		)
		expect(dlqBody.errorName).toBe("TypeError")
		expect(typeof dlqBody.failedAt).toBe("string")
		expect(dlqBody.originalContent).toBe("UNPARSEABLE")
		expect(dlqBody.queueName).toBe("task_queue")

		expect(mockChannel.ack).toHaveBeenCalled()
	})

	test("should log error when DLQ publish fails", async () => {
		mockPublish.mockResolvedValue(false)
		mockConsume.mockImplementation(
			(_channel, _queue, _bindings, callback) => {
				callback({ content: undefined }, mockChannel)

				return true
			},
		)

		const startWorker = await loadWorker()
		await startWorker()
		await new Promise((r) => setTimeout(r, 0))

		expect(mockPublish).toHaveBeenCalled()
		expect(mockChannel.ack).toHaveBeenCalled()
		expect(loggerMocks.error).toHaveBeenCalledWith(
			{
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				err: expect.any(Error),
				queue: {
					bindingKey: "task.#",
					channel: "worker",
					exchange: "main",
					msg: "UNPARSEABLE",
					queueName: "task_queue",
				},
			},
			"Worker failed to publish to DLQ",
		)
	})

	test("should start consuming when queue initializes successfully", async () => {
		mockConsume.mockResolvedValue(true)

		const startWorker = await loadWorker()
		await startWorker()

		expect(mockInit).toHaveBeenCalled()
		expect(mockConsume).toHaveBeenCalledWith(
			"worker",
			"task_queue",
			{ main: "task.#" },
			expect.any(Function),
		)
		expect(loggerMocks.info).toHaveBeenCalledWith(
			{
				queue: {
					bindingKey: "task.#",
					channel: "worker",
					exchange: "main",
					queueName: "task_queue",
				},
			},
			"Worker is running and waiting for messages",
		)
	})

	test("should exit when consume fails to start", async () => {
		const mockProcessExit = processExitMock()
		mockConsume.mockResolvedValue(false)

		const startWorker = await loadWorker()
		await startWorker()

		expect(mockInit).toHaveBeenCalled()
		expect(mockConsume).toHaveBeenCalled()
		expect(loggerMocks.error).toHaveBeenCalledWith(
			{
				queue: {
					bindingKey: "task.#",
					channel: "worker",
					exchange: "main",
					queueName: "task_queue",
				},
			},
			"Worker failed to start consuming",
		)
		expect(mockProcessExit).toHaveBeenCalled()

		restoreProcessExitMock()
	})

	test("should exit when queue initialization fails", async () => {
		const mockProcessExit = processExitMock()
		const error = new Error("RabbitMQ connection failed")
		mockInit.mockRejectedValue(error)

		const startWorker = await loadWorker()
		await startWorker()

		expect(mockInit).toHaveBeenCalled()
		expect(loggerMocks.error).toHaveBeenCalledWith(
			{
				err: error,
				queue: {
					bindingKey: "task.#",
					channel: "worker",
					exchange: "main",
					queueName: "task_queue",
				},
			},
			"Failed to start Worker",
		)
		expect(mockProcessExit).toHaveBeenCalled()

		restoreProcessExitMock()
	})
})
