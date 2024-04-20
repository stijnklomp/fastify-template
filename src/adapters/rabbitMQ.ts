import {
	initRabbitMQ,
	createExchange,
	sendToExchange,
	consume,
	ConsumeCallback,
} from "@/lib/rabbitMQ"
import { logger } from "@/lib/logger"

const Exchanges = {
	event: "x-test-event",
}

const RoutingKeys = {
	// eslint-disable-next-line camelcase
	x_event: "event",
}

const Queues = {
	event: "q-event",
}

export const init = async () => {
	try {
		await initRabbitMQ()

		// Initiate Exhcanges and Queues To Recieve Event Stream
		await createExchange(
			Exchanges.event,
			"direct",
			Queues.event,
			RoutingKeys.x_event,
			undefined,
		)
	} catch (err: any) {
		logger.error("Error Initializing RabbitMQ: ", err)
		throw new Error(err)
	}
}

export const sendToEvent = (payload: object) => {
	const exchange = Exchanges.event
	const routingKey = RoutingKeys.x_event

	sendToExchange(exchange, routingKey, payload)
}

export const subscribe = (q: string, listener: ConsumeCallback) => {
	consume(q, listener)
}
