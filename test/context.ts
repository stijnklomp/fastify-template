import { mock, beforeEach } from "bun:test"
import { createPrismaMock } from "bun-mock-prisma"
import fastify, { type FastifyServerOptions } from "fastify"

import { type PrismaClient } from "@/prismaClient"

export const newPrismaMock = {
	$connect: mock().mockResolvedValue(undefined),
	$disconnect: mock().mockResolvedValue(undefined),
}
export const prismaMock = createPrismaMock<PrismaClient>()

void mock.module("@/common/prisma", () => ({
	newPrismaClient: () => newPrismaMock,
	prismaClient: () => prismaMock,
}))

beforeEach(() => {
	newPrismaMock.$connect.mockClear()
	newPrismaMock.$disconnect.mockClear()
	prismaMock._reset()
})

const realFastify: typeof fastify = fastify

export const listenMock = mock()

await mock.module("fastify", () => ({
	default: Object.assign((opts?: FastifyServerOptions) => {
		const app = realFastify(opts)

		app.listen = listenMock

		return app
	}, realFastify),
}))
