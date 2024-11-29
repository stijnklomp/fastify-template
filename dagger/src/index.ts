/**
 * A generated module for FastifyTemplate functions
 *
 * This module has been generated via dagger init and serves as a reference to
 * basic module structure as you get started with Dagger.
 *
 * Two functions have been pre-created. You can modify, delete, or add to them,
 * as needed. They demonstrate usage of arguments and return types using simple
 * echo and grep commands. The functions can be called from the dagger CLI or
 * from one of the SDKs.
 *
 * The first line in this comment block is a short description line and the
 * rest is a long description with more detail on the module's purpose or usage,
 * if appropriate. All modules should have a short description.
 */
import { dag, Container, Directory, object, func } from "@dagger.io/dagger"

@object()
export class FastifyTemplate {
	/**
	 * Build a ready-to-use development environment
	 */
	@func()
	buildDependencies(source: Directory): Container {
		const nodeCache = dag.cacheVolume("node")

		return dag
			.container()
			.from("node:21-slim")
			.withDirectory("/src", source)
			.withDirectory("/test", source)
			.withMountedCache("/root/.npm", nodeCache)
			.withWorkdir("/src")
			.withExec(["npm", "ci", "--force"])
	}

	/**
	 * Return the result of running unit tests
	 */
	@func()
	async test(source: Directory): Promise<string> {
		// get the build environment container
		// by calling another Dagger Function
		return (
			this.buildDependencies(source)
				// call the test runner
				.withExec(["npm", "run", "test:unit"])
				// capture and return the command output
				.stdout()
		)
	}
}
