import { FastifyInstance } from "fastify"
import { createClient, RedisClientType } from "redis"
import amqplib, { ChannelModel } from "amqplib"
import { PrismaClient } from "@prisma/client"
import { DeepMockProxy, mockDeep } from "jest-mock-extended"

import { start } from "@/src/app"
import { build } from "@/helper"

jest.mock("redis")
jest.mock("amqplib")
jest.mock("@prisma/client", () => ({
	// eslint-disable-next-line @typescript-eslint/naming-convention
	PrismaClient: jest.fn(() => ({
		$connect: jest.fn(),
		$disconnect: jest.fn(),
	})),
	// eslint-disable-next-line @typescript-eslint/naming-convention
	__esModule: true,
}))

describe("server", () => {
	let mockRabbitMQConnect: jest.MockedFunction<typeof amqplib.connect>
	let mockedCacheCreateClient: jest.MockedFunction<() => RedisClientType>
	const mockCacheClient = {
		connect: jest.fn(),
		on: jest.fn(),
	} as unknown as RedisClientType
	let mockPrismaClient: DeepMockProxy<PrismaClient>

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
		mockPrismaClient = mockDeep<PrismaClient>()
	})

	it("should start the server without errors", async () => {
		mockPrismaClient.$connect.mockResolvedValue()

		const response = await start()

		expect(mockRabbitMQConnect).toHaveBeenCalled()
		expect(mockedCacheCreateClient).toHaveBeenCalled()

		await response.close()
	})

	it("should respond with 2xx on healthy state", async () => {
		mockPrismaClient.$connect.mockResolvedValue()

		const response = await app.inject({
			method: "GET",
			url: "/health",
		})

		expect(response.statusCode).toEqual(204)
		expect(response.payload).toBe("")
		expect(mockPrismaClient.$connect).toHaveBeenCalled()
		expect(mockPrismaClient.$disconnect).toHaveBeenCalled()
	})
})
