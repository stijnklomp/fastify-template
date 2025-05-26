import fastify, { FastifyServerOptions } from "fastify"
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import autoLoad from "@fastify/autoload"
import fastifySwagger from "@fastify/swagger"
import path from "path"
import hyperid from "hyperid"
import elasticAPM from "elastic-apm-node"
import { writeFileSync } from "fs"

import { loggerEnv, loggerConfig } from "@/common/logger"
import { init as initCache } from "@/infrastructure/cache"
import { init as initRabbitMQ } from "@/infrastructure/rabbitMQ"

const useElasticAPM = process.env.USE_ELASTIC_APM ?? "true"

if (loggerEnv !== "test" && useElasticAPM == "true") {
	elasticAPM.start({
		// apiKey: "./secrets/certs/apm-server/apm-server.key",
		captureBody: loggerEnv != "production" ? "all" : "off",
		// secretToken: "./secrets/certs/apm-server/apm-server.crt",
		secretToken: "secrettokengoeshere",
		// serverCaCertFile: "./secrets/certs/apm-server/apm-server.crt",
		serverUrl: "https://apm-server:8200",
		verifyServerCert: false,
	})
}

export const options: FastifyServerOptions = {
	genReqId: () => {
		return hyperid({ fixedLength: true, urlSafe: true })()
	},
	logger: loggerConfig,
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

// void fastifySetup.register(autoLoad, {
// 	dir: path.join(__dirname, "/config"),
// })

void fastifySetup.register(autoLoad, {
	dir: path.join(__dirname, "/middleware"),
})

void fastifySetup.register(autoLoad, {
	dir: path.join(__dirname, "/routes"),
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
		fastifySetup.log.error(err)
		process.exit(1)
	}
}

if (loggerEnv !== "test") void start()
