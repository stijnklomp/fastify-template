import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/prismaClient"

const createAdapter = () => {
	const connectionString = process.env.DATABASE_URL

	if (!connectionString) {
		throw new Error("DATABASE_URL environment variable is not defined")
	}

	return new PrismaPg({ connectionString })
}

export const createPrismaClient = () =>
	new PrismaClient({ adapter: createAdapter() })

export const prismaClient = createPrismaClient()
