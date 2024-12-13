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
	// Build stage
	/**
	 * Build project dependencies
	 */
	deps(source: Directory): Container {
		const nodeCache = dag.cacheVolume("node")

		return dag
			.container()
			.from("node:21-slim")
			.withWorkdir("/app")
			.withDirectory("/app", source, {
				include: ["package.json", "package-lock.json"],
			})
			.withMountedCache("/root/.npm", nodeCache)
			.withExec(["npm", "ci", "--ignore-scripts", "--force"])
	}

	/**
	 * Generate the Prisma Client
	 */
	prisma(source: Directory): Container {
		return this.deps(source)
			.withWorkdir("/app")
			.withDirectory("/app", source, {
				include: ["prisma"],
			})
			.withExec(["npx", "prisma", "generate"])
	}

	/**
	 * Include source code
	 */
	build(source: Directory): Container {
		return this.prisma(source)
			.withWorkdir("/app")
			.withDirectory("/app", source, {
				exclude: [
					"node_modules",
					".husky",
					"dist",
					"prisma",
					"dagger",
					"volume",
					".dockerignore",
					".env",
					".env.production", // Rename to `.env`?
					".eslintcache",
					".gitignore",
					".lintstagedrc.json",
					"dagger.json",
					"docker-compose.yml",
					"dockerComposeMigrate.sh",
					"Dockerfile",
					"LICENSE",
					"package.json",
					"package-lock.json",
					"test",
				],
			})
	}

	/**
	 * Build a ready-to-use development environment
	 */
	@func()
	buildDev(source: Directory): Container {
		return this.build(source).withDirectory("/app", source, {
			include: ["test"],
		})
	}

	/**
	 * Build a finalized production environment
	 */
	@func()
	buildProd(source: Directory): Container {
		return this.build(source).withExec(["npm", "run", "build"])
	}

	// Test stage
	/**
	 * Return the result of running unit tests
	 */
	@func()
	async unit(source: Directory): Promise<string> {
		return this.buildDev(source)
			.withExec(["npm", "run", "test:unit"])
			.stderr()
	}

	/**
	 * Return the result of running feature tests
	 */
	@func()
	async feature(source: Directory): Promise<string> {
		return this.buildDev(source)
			.withExec(["npm", "run", "test:feature"])
			.stderr()
	}

	/**
	 * Return the result of running acceptance tests
	 */
	@func()
	async acceptance(source: Directory): Promise<string> {
		return this.buildDev(source)
			.withExec(["npm", "run", "test:acceptance"])
			.stderr()
	}
}
