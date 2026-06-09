import { randomUUID } from "node:crypto"
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const dirName = dirname(fileURLToPath(import.meta.url))
const root = join(dirName, "..")

type Package = {
	description?: string
	license: string
	name: string
	publisher?: string
	version: string
}

function readLicense(pkg: Record<string, unknown>): string {
	const license = pkg.license

	if (typeof license === "string") {
		return license || "UNLICENSED"
	}

	if (license && typeof license === "object") {
		const lic = license as Record<string, unknown>

		if (typeof lic.type === "string") {
			return lic.type
		}
	}

	const licenses = pkg.licenses

	if (Array.isArray(licenses) && licenses.length > 0) {
		const first = licenses[0] as Record<string, unknown>

		if (typeof first.type === "string") {
			return first.type
		}
	}

	return "UNLICENSED"
}

function collectPackages(dir: string, seen: Set<string>): Package[] {
	const packages: Package[] = []

	if (!existsSync(dir)) {
		return packages
	}

	const entries = readdirSync(dir, { withFileTypes: true })

	for (const entry of entries) {
		if (entry.name.startsWith(".") || entry.name === ".bin") {
			continue
		}

		const fullPath = join(dir, entry.name)

		if (entry.name.startsWith("@") && entry.isDirectory()) {
			const sub = readdirSync(fullPath, { withFileTypes: true })

			for (const s of sub) {
				if (s.isDirectory()) {
					packages.push(
						...processPackage(
							join(fullPath, s.name),
							`${entry.name}/${s.name}`,
							seen,
						),
					)
				}
			}
		} else if (entry.isDirectory()) {
			packages.push(...processPackage(fullPath, entry.name, seen))
		}
	}

	return packages
}

function processPackage(
	pkgPath: string,
	name: string,
	seen: Set<string>,
): Package[] {
	const pkgJsonPath = join(pkgPath, "package.json")

	if (!existsSync(pkgJsonPath)) {
		return []
	}

	try {
		const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8")) as Record<
			string,
			unknown
		>
		const version = typeof pkg.version === "string" ? pkg.version : "0.0.0"
		const key = `${name}@${version}`

		if (seen.has(key)) {
			return []
		}

		seen.add(key)

		const result: Package = {
			license: readLicense(pkg),
			name,
			version,
		}

		if (typeof pkg.author === "string") {
			result.publisher = pkg.author
		} else if (pkg.author && typeof pkg.author === "object") {
			const a = pkg.author as Record<string, unknown>

			if (typeof a.name === "string") {
				result.publisher = a.name
			}
		}

		if (typeof pkg.description === "string") {
			result.description = pkg.description
		}

		const resultArr: Package[] = [result]
		const nested = join(pkgPath, "node_modules")

		if (existsSync(nested)) {
			resultArr.push(...collectPackages(nested, seen))
		}

		return resultArr
	} catch {
		return []
	}
}

const nm = join(root, "node_modules")

if (!existsSync(nm)) {
	console.error("node_modules not found. Run 'bun install' first.")
	process.exit(1)
}

console.error("Scanning dependencies...")
const packages = collectPackages(nm, new Set<string>())
packages.sort((a, b) => a.name.localeCompare(b.name))
console.error(`Found ${String(packages.length)} unique packages.`)

const sbom = {
	$schema: "http://cyclonedx.org/schema/bom-1.6.schema.json",
	bomFormat: "CycloneDX",
	components: packages.map((pkg) => {
		const comp: Record<string, unknown> = {
			name: pkg.name,
			type: "library",
			version: pkg.version,
		}

		comp["bom-ref"] = pkg.name

		if (pkg.license !== "UNLICENSED") {
			comp.licenses = [{ license: { id: pkg.license } }]
		}

		if (pkg.publisher) {
			comp.publisher = pkg.publisher
		}

		if (pkg.description) {
			comp.description = pkg.description
		}

		return comp
	}),
	dependencies: packages.map((pkg) => ({
		dependsOn: [],
		ref: pkg.name,
	})),
	metadata: {
		component: {
			name: "fragment-composer",
			type: "application",
			version: "1.0.0",
		},
		timestamp: new Date().toISOString(),
		tools: [
			{
				name: "fragment-composer",
				vendor: "stijnklomp",
				version: "1.0.0",
			},
		],
	},
	serialNumber: `urn:uuid:${randomUUID()}`,
	specVersion: "1.6",
	version: 1,
}

const outPath = join(root, "sbom.json")
writeFileSync(outPath, JSON.stringify(sbom, null, 2))
console.error(`SBOM written to ${outPath}`)
