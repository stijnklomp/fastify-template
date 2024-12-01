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
	 * Build project dependencies
	 */
	@func()
	buildDependencies(source: Directory): Container {
		const nodeCache = dag.cacheVolume("node")

		return dag
			.container()
			.from("node:21-slim")
			.withDirectory("/src", source, {
				exclude: [
					"node_modules",
					".husky",
					"dist",
					"dagger",
					"volume",
					".dockerignore",
					".env",
					".env.production", // Rename to `.env`?
					".eslintcache",
					".gitignore",
					"dagger.json",
					"docker-compose.yml",
					"dockerComposeMigrate.sh",
					"Dockerfile",
					"LICENSE",
					"test",
				],
			})
			.withMountedCache("/root/.npm", nodeCache)
			.withWorkdir("/src")
			.withExec(["npm", "ci", "--ignore-scripts", "--force"])
			.withExec(["npx", "prisma", "generate"])
	}

	/**
	 * Build a ready-to-use development environment
	 */
	@func()
	buildDevelopment(source: Directory): Container {
		return this.buildDependencies(source).withDirectory("/src", source, {
			include: ["test"],
		})
	}

	/**
	 * Build a finalized production environment
	 */
	@func()
	buildProduction(source: Directory): Container {
		return this.buildDependencies(source).withExec(["npm", "run", "build"])
	}

	/**
	 * Return the result of running unit tests
	 */
	@func()
	async test(source: Directory): Promise<string> {
		return this.buildDevelopment(source)
			.withExec(["npm", "run", "test:unit"])
			.stderr()
	}
}
