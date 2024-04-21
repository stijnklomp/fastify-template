import { PrismaClient } from "@prisma/client"

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
export const prisma = new PrismaClient()

export default {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	prisma,
}
