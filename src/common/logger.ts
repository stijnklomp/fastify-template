import { FastifyServerOptions, FastifyRequest, FastifyError } from "fastify"
import pino, { LevelWithSilentOrString, LoggerOptions } from "pino"

const sharedLoggerConfig: Pick<LoggerOptions, "serializers"> = {
	serializers: {
		err: (err: FastifyError & { validation?: unknown }) => {
			const baseError = {
				message: err.message,
				statusCode: err.statusCode,
				type: err.name,
			}

			return err.validation
				? { ...baseError, validation: err.validation }
				: baseError
		},
	},
}

type LoggerEnv = "development" | "production" | "test"

export const loggerEnvConfig: Record<
	LoggerEnv,
	FastifyServerOptions["logger"]
> = {
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
			...sharedLoggerConfig.serializers,
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
			req: (req: FastifyRequest) => ({
				method: req.method,
				parameters: req.params,
				path: req.routeOptions.url,
				url: req.url,
			}),
			...sharedLoggerConfig.serializers,
		},
	},
	test: false,
}

export const loggerEnv =
	(process.env.ENV as keyof typeof loggerEnvConfig | undefined) ??
	"production"

export const loggerConfig = loggerEnvConfig[loggerEnv]

const logLvl =
	(process.env.LOG_LEVEL as LevelWithSilentOrString | undefined) ?? "info"

export const logger = pino({ level: logLvl })

export const formatError = (err: unknown) =>
	err instanceof Error ? err.message : String(err)
