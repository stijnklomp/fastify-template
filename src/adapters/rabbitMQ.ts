import {
	init as createConnection,
	createExchange,
	sendToExchange,
	consume,
	ConsumeCallback,
} from "@/lib/rabbitMQ"

const exchanges = {
	event: "x-test-event",
}

const routingKeys = {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	x_event: "event",
}

const queues = {
	event: "q-event",
}

export const init = async () => {
	try {
		await createConnection()

		// Initiate exhcanges and queues to receive event stream
		await createExchange(
			exchanges.event,
			"direct",
			queues.event,
			routingKeys.x_event,
			undefined,
		)
	} catch (err: any) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		throw new Error(err)
	}
}

export const sendToEvent = (payload: object) => {
	const exchange = exchanges.event
	const routingKey = routingKeys.x_event

	sendToExchange(exchange, routingKey, payload)
}

export const subscribe = async (q: string, listener: ConsumeCallback) => {
	await consume(q, listener)
}
