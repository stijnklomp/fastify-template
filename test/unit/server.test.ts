import { FastifyInstance } from "fastify"
import { createClient, RedisClientType } from "redis"
import amqplib, { ChannelModel } from "amqplib"
import { PrismaClient } from "@/prismaClient"

import { start } from "@/src/app"
import { build } from "@/helper"
import { prisma } from "@/common/prisma"

jest.mock("redis")
jest.mock("amqplib")
jest.mock("@/common/prisma", () => ({
	// eslint-disable-next-line @typescript-eslint/naming-convention
	__esModule: true,
	prisma: jest.fn(() => ({
		$connect: jest.fn(),
		$disconnect: jest.fn(),
	})),
}))

describe("server", () => {
	let mockRabbitMQConnect: jest.MockedFunction<typeof amqplib.connect>
	let mockedCacheCreateClient: jest.MockedFunction<() => RedisClientType>
	const mockCacheClient = {
		connect: jest.fn(),
		on: jest.fn(),
	} as unknown as RedisClientType
	let mockPrisma: PrismaClient

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
		mockPrisma = prisma()
	})

	it("should start the server without errors", async () => {
		jest.mocked(mockPrisma.$connect).mockResolvedValue()

		const response = await start()

		expect(mockRabbitMQConnect).toHaveBeenCalled()
		expect(mockedCacheCreateClient).toHaveBeenCalled()

		await response.close()
	})

	it("should respond with 2xx on healthy state", async () => {
		const response = await app.inject({
			method: "GET",
			url: "/healthz",
		})

		expect(response.statusCode).toEqual(200)
		expect(response.payload).toBe("")
	})

	it("should respond with 2xx on ready state", async () => {
		jest.mocked(mockPrisma.$connect).mockResolvedValue()

		const response = await app.inject({
			method: "GET",
			url: "/readyz",
		})

		expect(response.statusCode).toEqual(204)
		expect(response.payload).toBe("")
		expect(mockPrisma.$connect).toHaveBeenCalled()
		expect(mockPrisma.$disconnect).toHaveBeenCalled()
	})
})
