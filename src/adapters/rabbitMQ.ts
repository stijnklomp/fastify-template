import {
	init as createConnection,
	createExchange,
	sendToExchange,
	consume,
	ConsumeCallback,
} from "@/lib/rabbitMQ"

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
		await createConnection()

		// Initiate Exhcanges and Queues To Recieve Event Stream
		await createExchange(
			Exchanges.event,
			"direct",
			Queues.event,
			RoutingKeys.x_event,
			undefined,
		)
	} catch (err: any) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		throw new Error(err)
	}
}

export const sendToEvent = (payload: object) => {
	const exchange = Exchanges.event
	const routingKey = RoutingKeys.x_event

	sendToExchange(exchange, routingKey, payload)
}

export const subscribe = async (q: string, listener: ConsumeCallback) => {
	await consume(q, listener)
}

export default {
	init,
	sendToEvent,
	subscribe,
}
