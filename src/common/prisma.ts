import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/prismaClient"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
	throw new Error("DATABASE_URL environment variable is not defined")
}

const adapter = new PrismaPg({ connectionString })
let prisma: PrismaClient | undefined

export const prismaClient = () => {
	if (typeof prisma !== "undefined") return prisma

	prisma = new PrismaClient({ adapter })

	return prisma
}

export const newPrismaClient = () => new PrismaClient({ adapter })
