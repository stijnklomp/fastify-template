import fp from "fastify-plugin"

export interface SupportPluginOptions {
	// Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>((fastify, _options, done) => {
	console.log("beginning of support plugin")
	fastify.decorate("someSupport", () => "hugs")
	console.log("end of support plugin")
	done()
})

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
	export interface FastifyInstance {
		someSupport(): string
	}
}
