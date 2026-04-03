import { mock, beforeEach } from "bun:test"
import { createPrismaMock } from "bun-mock-prisma"
import fastify, { type FastifyServerOptions } from "fastify"

import { type PrismaClient } from "@/prismaClient"
import * as prisma from "@/common/prisma"

export const realCreatePrismaClient = prisma.createPrismaClient

export const prismaPgMock = mock().mockReturnValue(process.env.DATABASE_URL)
export const prismaClientMock = mock()

await mock.module("@prisma/adapter-pg", () => ({
	// eslint-disable-next-line @typescript-eslint/naming-convention
	PrismaPg: prismaPgMock,
}))
await mock.module("@/prismaClient", () => ({
	// eslint-disable-next-line @typescript-eslint/naming-convention
	PrismaClient: prismaClientMock,
}))

export const newPrismaMock = {
	$connect: mock().mockResolvedValue(undefined),
	$disconnect: mock().mockResolvedValue(undefined),
}
export const prismaMock = createPrismaMock<PrismaClient>()

await mock.module("@/common/prisma", () => ({
	createPrismaClient: () => newPrismaMock,
	prismaClient: () => prismaMock,
}))

beforeEach(() => {
	prismaMock._reset()
})

const realFastify = fastify

export const listenMock = mock()

await mock.module("fastify", () => ({
	default: Object.assign((opts?: FastifyServerOptions) => {
		const app = realFastify(opts)

		app.listen = listenMock

		return app
	}, realFastify),
}))
