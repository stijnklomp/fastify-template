import { PrismaClient } from "@prisma/client"
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended"
import { prisma } from "@/common/prisma"

jest.mock("@/common/prisma", () => ({
	// eslint-disable-next-line @typescript-eslint/naming-convention
	__esModule: true,
	prisma: mockDeep<PrismaClient>(),
}))

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

afterEach(() => {
	mockReset(prismaMock)
})
