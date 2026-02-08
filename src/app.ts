import fastify, { type FastifyServerOptions } from "fastify"
import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import autoLoad from "@fastify/autoload"
import fastifySwagger from "@fastify/swagger"
import path from "node:path"
import { fileURLToPath } from "node:url"
import hyperid from "hyperid"
import { writeFileSync } from "node:fs"

import { logger, loggerEnv, loggerConfig } from "@/common/logger"
import { init as initCache } from "@/infrastructure/cache"
import { init as initRabbitMQ } from "@/infrastructure/rabbitMQ"

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url)
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(__filename)

export const options: FastifyServerOptions = {
	genReqId: () => {
		return hyperid({ fixedLength: true, urlSafe: true })()
	},
	logger: loggerConfig ?? false,
	serializerOpts: {
		rounding: "trunc",
	},
}

const fastifySetup = fastify(options).withTypeProvider<TypeBoxTypeProvider>()

// Automatically generate an OpenAPI spec from route schemas
void fastifySetup.register(fastifySwagger, {
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
				url: "http://localhost:3000",
			},
		],
		tags: [
			{ description: "User related end-points", name: "user" },
			{ description: "Code related end-points", name: "code" },
		],
	},
})

void fastifySetup.register(autoLoad, {
	dir: path.join(__dirname, "middleware"),
})

void fastifySetup.register(autoLoad, {
	dir: path.join(__dirname, "routes"),
	dirNameRoutePrefix: true,
})

export const start = async () => {
	try {
		await initCache()

		await initRabbitMQ()

		const port = Number(process.env.API_PORT ?? 3000)
		await fastifySetup.listen({
			host: "0.0.0.0",
			port,
		})

		fastifySetup.log.info(`Server listening on port ${port.toString()}`)

		await fastifySetup.ready()

		const openapiSpec = fastifySetup.swagger({ yaml: true })
		writeFileSync("./openapi.yaml", openapiSpec)

		return fastifySetup
	} catch (err) {
		logger.error(err)
		process.exit(1)
	}
}

if (loggerEnv !== "test") void start()
