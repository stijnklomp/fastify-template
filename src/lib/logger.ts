import winston from "winston"

const colorizer = winston.format.colorize()

const logLevel = "debug"

export const logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.simple(),
		winston.format.printf((msg) =>
			colorizer.colorize(
				msg.level,
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				`${msg.timestamp} - ${msg.level}: ${msg.message}`,
			),
		),
	),
	level: logLevel,
	transports: [new winston.transports.Console()],
})
