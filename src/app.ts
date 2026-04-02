import fastify, { type FastifyServerOptions } from "fastify"
import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import fastifySwagger from "@fastify/swagger"
import hyperid from "hyperid"
import { writeFileSync } from "node:fs"

import { logger, loggerEnv, loggerConfig } from "@/common/logger"
import { registerMiddleware } from "@/middleware/index"
import { registerRoutes } from "@/routes/index"
import { cacheClient } from "@/infrastructure/cache"
import { queueClient } from "@/infrastructure/rabbitMQ"

const port = Number(process.env.API_PORT ?? 3000)
const gen = hyperid({ fixedLength: true, urlSafe: true })
const buildApp = (
	fastifyOptions: FastifyServerOptions = {
		genReqId: () => gen(),
		logger: loggerConfig ?? false,
		serializerOpts: {
			rounding: "trunc",
		},
	},
) => {
	const app = fastify(fastifyOptions).withTypeProvider<TypeBoxTypeProvider>()

	// Automatically generate an OpenAPI spec from route schemas
	void app.register(fastifySwagger, {
		openapi: {
			components: {
				securitySchemes: {
					apiKey: {
						in: "header",
						name: "apiKey",
						type: "apiKey",
					},
				},
			},
			externalDocs: {
				description: "Find more info here",
				url: "https://swagger.io",
			},
			info: {
				description: "Testing the Fastify swagger API",
				title: "Test swagger",
				version: "0.1.0",
			},
			openapi: "3.1.0",
			servers: [
				{
					description: "Development server",
					url: `http://localhost:${port}`,
				},
			],
			tags: [
				{ description: "User related end-points", name: "user" },
				{ description: "Code related end-points", name: "code" },
			],
		},
	})

	void registerMiddleware(app)
	void registerRoutes(app)

	return app
}

export const start = async (
	appOptions?: {
		writeOpenapi?: boolean
	},
	fastifyOptions?: FastifyServerOptions,
) => {
	const writeOpenapi =
		appOptions?.writeOpenapi ?? process.env.NODE_ENV !== "production"

	try {
		const app = buildApp(fastifyOptions)

		await cacheClient.init()

		await queueClient.init()

		await app.listen({
			host: "0.0.0.0",
			port,
		})

		logger.info(`Server listening on port ${port.toString()}`)

		await app.ready()

		if (writeOpenapi) {
			const openapiSpec = app.swagger({ yaml: true })
			writeFileSync("./openapi.yaml", openapiSpec)
		}

		return app
	} catch (err) {
		logger.error(err)
		process.exit(1)
	}
}

if (loggerEnv !== "test") void start()
