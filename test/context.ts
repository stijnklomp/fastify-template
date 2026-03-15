import { mock } from "bun:test"
import { createPrismaMock } from "bun-mock-prisma"

import { type PrismaClient } from "@/prismaClient"

export const prismaMock = createPrismaMock<PrismaClient>()

await mock.module("@/common/prisma", () => ({
	prisma: () => prismaMock,
}))
