import { PrismaClient } from "@prisma/client"
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended"
import { prisma } from "@/utils/prisma"

jest.mock("@/utils/prisma", () => ({
	__esModule: true,
	prisma: mockDeep<PrismaClient>(),
}))

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

afterEach(() => {
	mockReset(prismaMock)
})
