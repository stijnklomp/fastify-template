import fp from "fastify-plugin"

// Specify support plugin options here
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type SupportPluginOptions = {}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>((fastify) => {
	fastify.decorate("someSupport", () => "hugs")
})

// When using .decorate you have to specify added properties for Typescript
// declare module "fastify" {
// 	export type FastifyInstance = {
// 		someSupport(): string
// 	}
// }
