import { logger, loggerEnv } from "@/common/logger"

const deploymentMode = process.env.DEPLOYMENT_MODE ?? "api"

type ApiModule = {
	start: (opts?: { writeOpenapi?: boolean }) => Promise<unknown>
}
type WorkerModule = { startWorker: () => Promise<void> }

const main = async () => {
	logger.info({ deploymentMode }, "Starting application")

	if (deploymentMode === "worker") {
		const worker = (await import("@/worker/index")) as WorkerModule
		await worker.startWorker()
	} else {
		const api = (await import("@/api/app")) as ApiModule
		await api.start({ writeOpenapi: loggerEnv !== "production" })
	}
}

if (loggerEnv !== "test") void main()
