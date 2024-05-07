import Fastify from "fastify"
import AutoLoad from "@fastify/autoload"
import path from "path"

describe("server", () => {
	const fastify = Fastify() // USE HELPER INSTEAD

	beforeAll(async () => {
		await fastify.register(AutoLoad, {
			dir: path.join(__dirname, "../../src/plugins"),
		})
		await fastify.register(AutoLoad, {
			dir: path.join(__dirname, "../../src/routes"),
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
