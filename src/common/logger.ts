import {
	type FastifyServerOptions,
	type FastifyRequest,
	type FastifyReply,
	type FastifyError,
} from "fastify"
import pino, { type LevelWithSilentOrString, type LoggerOptions } from "pino"

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
		res: (res: FastifyReply) => {
			const req = res.request

			return {
				path: req.routeOptions.url ?? req.url,
				statusCode: res.statusCode,
			}
		},
	},
}

const requestLogLevel =
	(process.env.REQUEST_LOG_LEVEL as LevelWithSilentOrString | undefined) ??
	"info"

const customLogLevel =
	(process.env.CUSTOM_LOG_LEVEL as LevelWithSilentOrString | undefined) ??
	"info"

const isDev = process.env.NODE_ENV === "development"

export const loggerConfig: FastifyServerOptions["logger"] = isDev
	? {
			level: requestLogLevel,
			redact: ["req.headers.authorization"],
			serializers: {
				req: (req: FastifyRequest) => ({
					headers: req.headers,
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
		}
	: {
			level: requestLogLevel,
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
		}

export const logger = pino({ level: customLogLevel })
