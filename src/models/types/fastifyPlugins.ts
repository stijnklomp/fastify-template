import { FastifyPluginCallback } from "fastify"

export type FastifyPluginReturnValue = {
	[index: string]: FastifyPluginCallback
}
