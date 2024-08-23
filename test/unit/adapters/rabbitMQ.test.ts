import rabbitMQLib from "@/lib/rabbitMQ"
import { logger } from "@/lib/logger"
import {
	init as createConnection,
	sendToEvent,
	subscribe,
} from "@/adapters/rabbitMQ"
import { Channel } from "amqplib"

jest.mock("@/lib/rabbitMQ", () => ({
	init: jest.fn(),
	createExchange: jest.fn(),
	sendToExchange: jest.fn(),
	consume: jest.fn(),
}))

// const mockInitRabbitMQ = init as jest.MockedFunction<typeof init>
// const mockCreateExchange = createExchange as jest.MockedFunction<
// 	typeof createExchange
// >
// const mockSendToExchange = sendToExchange as jest.MockedFunction<
// 	typeof sendToExchange
// >
// const mockConsume = consume as jest.MockedFunction<typeof consume>

const exchanges = {
	event: "x-test-event",
}

const routingKeys = {
	// eslint-disable-next-line camelcase
	x_event: "event",
}

const queues = {
	event: "q-event",
}

describe("rabitMQ adapter", () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe("init", () => {
		it("should successfully init", async () => {
			// mockInitRabbitMQ.mockResolvedValue({} as Channel)
			// mockCreateExchange.mockResolvedValue(undefined)

			// await createConnection()

			// expect(mockInitRabbitMQ).toBeCalledTimes(1)
			// expect(mockInitRabbitMQ).toBeCalledWith()
			// expect(mockCreateExchange).toBeCalledTimes(1)
			// expect(mockCreateExchange).toBeCalledWith(
			// 	exchanges.event,
			// 	"direct",
			// 	queues.event,
			// 	routingKeys.x_event,
			// 	undefined,
			// )
			await createConnection()

			expect(rabbitMQLib.init).toHaveBeenCalledOnce()
		})

		// it("should fail to init", async () => {
		// 	mockInitRabbitMQ.mockRejectedValue("RabbitMQ Not Running")
		// 	mockCreateExchange.mockResolvedValue(undefined)

		// 	try {
		// 		await createConnection()
		// 	} catch (err) {
		// 		logger.error(err)
		// 	}

		// 	await mockCreateExchange(
		// 		exchanges.event,
		// 		"direct",
		// 		queues.event,
		// 		routingKeys.x_event,
		// 		undefined,
		// 	)

		// 	expect(mockInitRabbitMQ).toBeCalledTimes(1)
		// 	expect(mockInitRabbitMQ).toBeCalledWith()
		// 	expect(mockCreateExchange).toBeCalledTimes(1)
		// })
	})

	// describe("sendToEvent", () => {
	// 	const exchange = exchanges.event
	// 	const routing_key = routingKeys.x_event

	// 	it("should sent to event", async () => {
	// 		const payload = {}
	// 		mockSendToExchange.mockResolvedValue(undefined)

	// 		await sendToEvent(payload)

	// 		expect(mockSendToExchange).toBeCalledTimes(1)
	// 		expect(mockSendToExchange).toBeCalledWith(
	// 			exchange,
	// 			routing_key,
	// 			payload,
	// 		)
	// 	})
	// })

	// describe("subscribe", () => {
	// 	it("should fire subscribe successfully", async () => {
	// 		mockConsume.mockReturnValue(undefined)

	// 		subscribe("event", () => {})
	// 	})
	// })
})
