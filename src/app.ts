import fastify, {
	FastifyServerOptions,
	FastifyRequest,
	// FastifyReply,
} from "fastify"
import autoLoad from "@fastify/autoload"
import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUI from "@fastify/swagger-ui"
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
				headers: req.headers, // Including the headers in the log could be in violation of privacy laws, e.g. GDPR. It could also leak authentication data in the logs. It should not be saved
				ip: req.ip,
				ips: req.ips,
				method: req.method,
				parameters: req.params,
				path: req.routeOptions.url,
				protocol: req.protocol,
				url: req.url,
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
			options: {
				ignore: "pid,hostname",
				translateTime: "HH:MM:ss Z",
			},
			target: "pino-pretty",
		},
	},
	production: {
		redact: ["req.headers"],
		serializers: {
			req: (req: FastifyRequest) => {
				return {
					method: req.method,
					parameters: req.params,
					path: req.routeOptions.url,
					url: req.url,
				}
			},
		},
	},
	test: false,
}
const logsEnvironment =
	(process.env.LOGS as keyof typeof envToLogger | undefined) ?? "production"

export const options: FastifyServerOptions = {
	genReqId: () => {
		return hyperid({ fixedLength: true, urlSafe: true })()
	},
	logger: envToLogger[logsEnvironment],
	serializerOpts: {
		rounding: "trunc", // Same as default but set for clarity
	},
}

const fastifySetup = fastify(options)

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
	swagger: {
		consumes: ["application/json"],
		host: "localhost",
		info: {
			description: "My Description.",
			title: "My Title",
			version: "1.0.0",
		},
		produces: ["application/json"],
		schemes: ["http", "https"],
		tags: [{ description: "Default", name: "Default" }],
	},
})

void fastifySetup.register(fastifySwaggerUI, {
	baseDir: path.resolve("dist/static"),
	routePrefix: "/docs",
	staticCSP: true,
	transformSpecification: (swaggerObject) => {
		return swaggerObject
	},
	transformSpecificationClone: true,
	transformStaticCSP: (header) => header,
	uiConfig: {
		deepLinking: false,
		docExpansion: "list",
	},
	uiHooks: {
		onRequest: function (req, rep, next) {
			next()
		},
		preHandler: function (req, rep, next) {
			next()
		},
	},
})

const provider = new NodeTracerProvider()

provider.register()

registerInstrumentations({
	instrumentations: [new HttpInstrumentation(), new FastifyInstrumentation()],
})

void fastifySetup.register(autoLoad, {
	dir: path.join(__dirname, "/plugins"),
})

void fastifySetup.register(autoLoad, {
	dir: path.join(__dirname, "/routes"),
	dirNameRoutePrefix: true, // Same as default but set for clarity
})

const start = async () => {
	try {
		await initRedis()
		await initRabbitMQ()
		const port = Number(process.env.API_PORT ?? 3000)
		await fastifySetup.listen({
			host: "0.0.0.0",
			port,
		})
		fastifySetup.log.info(`Server listening on port ${port.toString()}`)
	} catch (err) {
		fastifySetup.log.error(err)
		process.exit(1)
	}
}

if (logsEnvironment !== "test") void start()
