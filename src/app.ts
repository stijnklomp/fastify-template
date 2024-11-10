import Fastify, {
	FastifyServerOptions,
	FastifyRequest,
	// FastifyReply,
} from "fastify"
import AutoLoad from "@fastify/autoload"
import FastifySwagger from "@fastify/swagger"
import FastifySwaggerUI from "@fastify/swagger-ui"
import path from "path"
import hyperid from "hyperid"
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node"
import { registerInstrumentations } from "@opentelemetry/instrumentation"
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http"
import { FastifyInstrumentation } from "@opentelemetry/instrumentation-fastify"

import { init as initRedis } from "@/adapters/redis"
import { init as initRabbitMQ } from "@/adapters/rabbitMQ"
// import { IncomingMessage, ServerResponse } from "http"

const envToLogger = {
	development: {
		redact: ["req.headers.authorization"],
		serializers: {
			req: (req: FastifyRequest) => ({
				method: req.method,
				url: req.url,
				protocol: req.protocol,
				path: req.routeOptions.url,
				ip: req.ip,
				ips: req.ips,
				parameters: req.params,
				headers: req.headers, // Including the headers in the log could be in violation of privacy laws, e.g. GDPR. It could also leak authentication data in the logs. It should not be saved
			}),
			// res: (rep: FastifyReply) => ({
			// 	// Todo: This is causing Typescript issues because it is expecting `ServerResponse<IncomingMessage>`
			// 	// res: (
			// 	// 	rep: FastifyReply,
			// 	// ): ServerResponse<IncomingMessage> => ({
			// 	statusCode: rep.statusCode,
			// 	headers:
			// 		typeof rep.getHeaders === "function"
			// 			? rep.getHeaders()
			// 			: {},
			// }),
		},
		transport: {
			target: "pino-pretty",
			options: {
				translateTime: "HH:MM:ss Z",
				ignore: "pid,hostname",
			},
		},
	},
	production: {
		redact: ["req.headers"],
		serializers: {
			req: (req: FastifyRequest) => {
				return {
					method: req.method,
					url: req.url,
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					path: req.routerPath,
					parameters: req.params,
				}
			},
		},
	},
	test: false,
}
const logsEnvironment =
	(process.env.LOGS as keyof typeof envToLogger | undefined) ?? "production"

export const options: FastifyServerOptions = {
	serializerOpts: {
		rounding: "trunc", // Same as default but set for clarity
	},
	logger: envToLogger[logsEnvironment],
	genReqId: () => {
		return hyperid({ fixedLength: true, urlSafe: true })()
	},
}

const fastify = Fastify(options)

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
	baseDir: path.resolve("dist/static"),
	routePrefix: "/docs",
	uiConfig: {
		docExpansion: "list",
		deepLinking: false,
	},
	uiHooks: {
		onRequest: function (req, reply, next) {
			next()
		},
		preHandler: function (req, reply, next) {
			next()
		},
	},
	staticCSP: true,
	transformStaticCSP: (header) => header,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	transformSpecification: (swaggerObject, req, reply) => {
		return swaggerObject
	},
	transformSpecificationClone: true,
})

const provider = new NodeTracerProvider()

provider.register()

registerInstrumentations({
	instrumentations: [new HttpInstrumentation(), new FastifyInstrumentation()],
})

void fastify.register(AutoLoad, {
	dir: path.join(__dirname, "/plugins"),
})

void fastify.register(AutoLoad, {
	dir: path.join(__dirname, "/routes"),
	dirNameRoutePrefix: true, // Same as default but set for clarity
})

const start = async () => {
	try {
		await initRedis()
		await initRabbitMQ()
		const port = Number(process.env.API_PORT ?? 3000)
		await fastify.listen({
			port,
			host: "0.0.0.0",
		})
		fastify.log.info(`Server listening on port ${port}`)
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}

if (logsEnvironment !== "test") void start()
