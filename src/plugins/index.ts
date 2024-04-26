// We manually export files into app.ts due to the app being bundled into one file
// import { FastifyPluginReturnValue } from "@/types/fastifyPlugins"
import cors from "./cors"
import helmet from "./helmet"
import sensible from "./sensible"
import support from "./support"

export default [cors, helmet, sensible, support]
