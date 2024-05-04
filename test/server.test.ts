// require("dotenv").config();

import path from "path"
import Fastify from "fastify"
import AutoLoad from "@fastify/autoload"

describe("server", () => {
	const fastify = Fastify()

	beforeAll(async () => {
		await fastify.register(AutoLoad, {
			dir: path.join(__dirname, "../main/plugins"),
		})
		await fastify.register(AutoLoad, {
			dir: path.join(__dirname, "../main/routes"),
		})
		await fastify.listen({
			port: Number(process.env.PORT),
			host: "0.0.0.0",
		})
	})

	afterAll(async () => {
		await fastify.close()
	})

	it("should start the server without errors", async () => {
		const response = await fastify.inject({
			method: "GET",
			url: "/",
		})
		expect(response.statusCode).toEqual(404)
	})
})
