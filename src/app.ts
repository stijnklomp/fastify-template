// import * as path from "path"
// import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload"
// import { FastifyPluginAsync } from "fastify"
// import helmet from "@fastify/helmet"
// import { fileURLToPath } from "url"

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// export type AppOptions = {
// 	// Place your custom options for app below here.
// } & Partial<AutoloadPluginOptions>

// // Pass --options via CLI arguments in command to enable these options.
// const options: AppOptions = {}

// const app: FastifyPluginAsync<AppOptions> = async (
// 	fastify,
// 	opts,
// ): Promise<void> => {
// 	void fastify.register(helmet)

// 	// Do not touch the following lines

// 	// This loads all plugins defined in plugins
// 	// those should be support plugins that are reused
// 	// through your application
// 	// void fastify.register(AutoLoad, {
// 	// 	dir: path.join(__dirname, "plugins"),
// 	// 	options: opts,
// 	// 	forceESM: true,
// 	// })

// 	// This loads all plugins defined in routes
// 	// define your routes in one of these
// 	void fastify.register(AutoLoad, {
// 		dir: path.join(__dirname, "routes"),
// 		options: opts,
// 		forceESM: true,
// 	})
// }

// export default app
// export { app, options }

import Fastify, { FastifyRequest, FastifyReply } from "fastify"
import AutoLoad from "@fastify/autoload"
import path from "path"

import { logger } from "./lib/logger"
import { adapters } from "./adapters"
import prisma from "./utils/prisma"

const fastify = Fastify({
	logger: {
		transport: {
			target: "pino-pretty",
			options: {
				translateTime: "HH:MM:ss Z",
				ignore: "pid,hostname",
			},
		},
	},
	serializerOpts: {
		res(reply: FastifyReply) {
			return {
				statusCode: reply.statusCode,
			}
		},
		req(req: FastifyRequest) {
			return {
				method: req.method,
				url: req.url,
				hostname: req.hostname,
				remoteAddress: req.ip,
				remotePort: req.connection.remotePort,
				headers: req.headers,
			}
		},
	},
})

void fastify.register(AutoLoad, {
	dir: path.join(__dirname, "plugins"),
})

void fastify.register(AutoLoad, {
	dir: path.join(__dirname, "routes"),
})

const start = async () => {
	try {
		await fastify.listen({
			port: process.env.PORT,
			host: "0.0.0.0",
		})
		await adapters().cache.primary.init()
		await adapters().queue.init()
		prisma
			.$connect()
			.then(() => {
				logger.info("Testing DB Connection. OK")
				prisma.$disconnect()
			})
			.catch(() => logger.error("Can't Connect to DB"))
		logger.info(`Server listening on port ${process.env.PORT}`)
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}

void start()
