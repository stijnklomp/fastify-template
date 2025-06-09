import { PrismaClient } from "@prisma/client"
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended"
import { prisma } from "@/common/prisma"

jest.mock("@/common/prisma", () => {
	const prismaMock = mockDeep<PrismaClient>()

	return {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		__esModule: true,
		prisma: () => prismaMock,
	}
})

export const prismaMock = prisma() as DeepMockProxy<PrismaClient>

afterEach(() => {
	mockReset(prismaMock)
})
