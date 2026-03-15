import { existsSync } from "fs"
import { config as dotenvConfig } from "dotenv"
import { defineConfig, env } from "prisma/config"

const envFile = existsSync(".env") ? ".env" : ".env.development"
dotenvConfig({ path: envFile })

export default defineConfig({
	datasource: {
		url: env("DATABASE_URL"),
	},
	migrations: {
		path: "prisma/migrations",
	},
	schema: "prisma/schema.prisma",
})
