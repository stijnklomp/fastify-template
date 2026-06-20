import { logger } from "@/common/logger"

const deploymentMode = process.env.DEPLOYMENT_MODE

type ApiModule = {
	start: (opts?: { writeOpenapi?: boolean }) => Promise<unknown>
}
type WorkerModule = { startWorker: () => Promise<void> }

const main = async () => {
	if (!deploymentMode) {
		logger.error(
			"DEPLOYMENT_MODE environment variable is required. Set to 'api' or 'worker'.",
		)
		process.exit(1)
	}

	logger.info({ deploymentMode }, "Starting application")

	if (deploymentMode === "worker") {
		const worker = (await import("@/worker/index")) as WorkerModule
		await worker.startWorker()
	} else {
		const api = (await import("@/api/app")) as ApiModule
		await api.start({ writeOpenapi: process.env.NODE_ENV !== "production" })
	}
}

if (process.env.NODE_ENV !== "test") void main()
