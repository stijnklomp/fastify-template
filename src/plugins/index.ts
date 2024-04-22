import fp from "fastify-plugin"

// We have to manually export files due to the app being bundled into one file
import cors from "./cors"
import helmet from "./helmet"
import sensible from "./sensible"
import support from "./support"

// export default <
// 	FastifyPluginCallback<
// 		FastifyPluginOptions,
// 		RawServerDefault,
// 		FastifyTypeProvider,
// 		FastifyBaseLogger
// 	>
// >{
// 	cors,
// 	helmet,
// 	sensible,
// 	support,
// }
type FastifyPluginReturnValue = {
	[index: string]: ReturnType<typeof fp>
}

export default <FastifyPluginReturnValue>{
	cors,
	helmet,
	sensible,
	support,
}
