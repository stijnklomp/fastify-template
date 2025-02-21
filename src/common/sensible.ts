import fp from "fastify-plugin"
import sensible, { FastifySensibleOptions } from "@fastify/sensible"

// TODO: This utility requires implementation for the JSON schema: https://github.com/fastify/fastify-sensible

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp<FastifySensibleOptions>(async (fastify) => {
	await fastify.register(sensible)
})
