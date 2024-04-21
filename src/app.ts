/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import Fastify, { FastifyRequest, FastifyReply } from "fastify"
// import AutoLoad from "@fastify/autoload"
// import path from "path"

// import { logger } from "@/lib/logger"
// import rabbitMQ from "@/adapters/rabbitMQ"
// import redis from "@/adapters/redis"
// import { prisma } from "@/utils/prisma"

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

// void fastify.register(AutoLoad, {
// 	dir: path.join(__dirname, "plugins"),
// })

// void fastify.register(AutoLoad, {
// 	dir: path.join(__dirname, "routes"),
// })
fastify.get("/", () => ({ hello: "world" }))

const start = async () => {
	try {
		const port = Number(process.env.PORT ?? 3000)
		await fastify.listen({
			port,
			host: "0.0.0.0",
		})
		// await rabbitMQ.init()
		// await redis.init()
		// prisma
		// 	.$connect()
		// 	.then(() => {
		// 		logger.info("Testing DB Connection. OK")
		// 		prisma.$disconnect()
		// 	})
		// 	.catch(() => logger.error("Can't Connect to DB"))
		// logger.info(`Server listening on port ${port}`)
		console.log(`Server listening on port ${port}`)
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}

void start()
