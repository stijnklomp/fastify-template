// This file contains code that we reuse between our tests.
import Fastify from "fastify"
import AutoLoad from "@fastify/autoload"
import path from "path"
import * as test from "node:test"

export type TestContext = {
	after: typeof test.after
}

// Automatically build and tear down our instance
export const build = async (t: TestContext) => {
	// fastify-plugin ensures that all decorators
	// are exposed for testing purposes, this is
	// different from the production setup
	const fastify = Fastify()
	await fastify.register(AutoLoad, {
		dir: path.join(__dirname, "../src/plugins"),
	})
	await fastify.register(AutoLoad, {
		dir: path.join(__dirname, "../src/routes"),
	})
	await fastify.listen({
		port: Number(process.env.PORT),
		host: "0.0.0.0",
	})

	// Tear down our app after we are done
	t.after(() => void fastify.close())

	return fastify
}
