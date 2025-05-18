import { FastifyInstance } from "fastify"
import { createClient, RedisClientType } from "redis"
import amqplib, { ChannelModel } from "amqplib"

import { start } from "@/src/app"
import { prismaMock } from "@/context"
import { build } from "@/helper"

jest.mock("redis")
jest.mock("amqplib")

describe("server", () => {
	let mockRabbitMQConnect: jest.MockedFunction<typeof amqplib.connect>
	let mockedCacheCreateClient: jest.MockedFunction<() => RedisClientType>
	const mockCacheClient = {
		connect: jest.fn(),
		on: jest.fn(),
	} as unknown as RedisClientType

	let app: FastifyInstance
	const instance: () => FastifyInstance = build()

	beforeAll(() => {
		app = instance()
	})

	beforeEach(() => {
		mockRabbitMQConnect = amqplib.connect as jest.Mock
		mockRabbitMQConnect.mockResolvedValue(
			undefined as unknown as ChannelModel,
		)
		mockedCacheCreateClient = createClient as jest.Mock
		mockedCacheCreateClient.mockImplementation(() => mockCacheClient)
	})

	it("should start the server without errors", async () => {
		prismaMock.$connect.mockResolvedValue()

		const response = await start()

		expect(mockRabbitMQConnect).toHaveBeenCalled()
		expect(mockedCacheCreateClient).toHaveBeenCalled()

		await response.close()
	})

	it("should respond with 2xx on healthy state", async () => {
		prismaMock.$connect.mockResolvedValue()

		const response = await app.inject({
			method: "GET",
			url: "/health",
		})

		expect(response.statusCode).toEqual(204)
		expect(response.payload).toBe("")
	})
})
