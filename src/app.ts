/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import Fastify, { FastifyRequest, FastifyReply } from "fastify"
import autoLoad from "@fastify/autoload"
// import path from "path"
import FastifySwagger from "@fastify/swagger"
import FastifySwaggerUI from "@fastify/swagger-ui"
import path from "node:path"
import plugins from "@/plugins/index"
// import support from "@/plugins/support"

// import { logger } from "@/lib/logger"
// import rabbitMQ from "@/adapters/rabbitMQ"
// import redis from "@/adapters/redis"
// import { prisma } from "@/utils/prisma"

const fastify = Fastify({
	// logger: {
	// 	req(req: FastifyRequest) {
	// 		console.log("serializerOpts")

	// 		return {
	// 			method: req.method,
	// 			url: req.url,
	// 			hostname: req.hostname,
	// 			remoteAddress: req.ip,
	// 			remotePort: req.connection.remotePort,
	// 			headers: req.headers,
	// 		}
	// 	},
	// 	res(reply: FastifyReply) {
	// 		return {
	// 			statusCode: reply.statusCode,
	// 		}
	// 	},
	// 	// transport: {
	// 	// 	target: "pino-pretty",
	// 	// 	options: {
	// 	// 		translateTime: "HH:MM:ss Z",
	// 	// 		ignore: "pid,hostname",
	// 	// 	},
	// 	// },
	// },
	serializerOpts: {
		rounding: "trunc", // Same as default but set for clarity
	},
})

void fastify.register(FastifySwagger, {
	openapi: {
		openapi: "3.1.0",
		info: {
			title: "Test swagger",
			description: "Testing the Fastify swagger API",
			version: "0.1.0",
		},
		servers: [
			{
				url: "http://localhost:3000",
				description: "Development server",
			},
		],
		tags: [
			{ name: "user", description: "User related end-points" },
			{ name: "code", description: "Code related end-points" },
		],
		components: {
			securitySchemes: {
				apiKey: {
					type: "apiKey",
					name: "apiKey",
					in: "header",
				},
			},
		},
		externalDocs: {
			url: "https://swagger.io",
			description: "Find more info here",
		},
	},
	swagger: {
		info: {
			title: "My Title",
			description: "My Description.",
			version: "1.0.0",
		},
		host: "localhost",
		schemes: ["http", "https"],
		consumes: ["application/json"],
		produces: ["application/json"],
		tags: [{ name: "Default", description: "Default" }],
	},
})

void fastify.register(FastifySwaggerUI, {
	// baseDir: "/home/stijn/developer/personal/fastify-template/dist/static",
	baseDir: path.resolve("dist/static"),
	routePrefix: "/docs",
	uiConfig: {
		docExpansion: "list",
		deepLinking: false,
	},
	uiHooks: {
		onRequest: function (request, reply, next) {
			next()
		},
		preHandler: function (request, reply, next) {
			next()
		},
	},
	staticCSP: true,
	transformStaticCSP: (header) => header,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	transformSpecification: (swaggerObject, request, reply) => {
		return swaggerObject
	},
	transformSpecificationClone: true,
})

console.log("path.resolve('src/plugins'):", path.resolve("src/plugins"))
console.log("__dirname:", __dirname)

for (const property in plugins) {
	void fastify.register(plugins[property])
}

// void fastify.register(autoLoad, {
// 	// dir: path.resolve("src/plugins"),
// 	dir: "/home/stijn/developer/personal/fastify-template/dist/plugins",
// 	// dir: path.join(__dirname, "plugins"),
// 	// dir: join(dirName, "plugins"),
// 	// dir: path.join(__dirname, "plugins"),
// })

// void fastify.register(support)

// void fastify.register(autoLoad, {
// 	dir: path.join(__dirname, "routes"),
// })

void fastify.register((app, options, done) => {
	app.get("/", {
		schema: {
			tags: ["Default"],
			response: {
				200: {
					type: "object",
					properties: {
						anything: { type: "string" },
					},
				},
			},
		},
		handler: async (req, res) => {
			await res.send({ anything: "meaningfull" })
		},
	})
	done()
})

const start = async () => {
	try {
		console.log("before listen")
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
