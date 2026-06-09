import { readFileSync, readdirSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const dirName = dirname(fileURLToPath(import.meta.url))
const root = join(dirName, "..")

const STRONG_COPYLEFT = [
	/^GPL(-[23](\.0)?)?(-only|-or-later|\+)?$/,
	/^AGPL(-[123](\.0)?)?(-only|-or-later|\+)?$/,
	/^EUPL-1\./,
	/^OSL-/,
	/^RPL-/,
	/^CPAL-/,
]

const WEAK_COPYLEFT = [/^LGPL-/, /^MPL-/, /^EPL-/, /^CDDL-/]

type DepInfo = {
	license: string
	name: string
	version: string
}

function isMatch(license: string, patterns: RegExp[]): boolean {
	return patterns.some((p) => p.test(license.trim()))
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

function collectPackages(dir: string, seen: Set<string>): DepInfo[] {
	const packages: DepInfo[] = []

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
					processPackage(
						join(fullPath, s.name),
						`${entry.name}/${s.name}`,
						packages,
						seen,
					)
				}
			}
		} else if (entry.isDirectory()) {
			processPackage(fullPath, entry.name, packages, seen)
		}
	}

	return packages
}

function processPackage(
	pkgPath: string,
	name: string,
	packages: DepInfo[],
	seen: Set<string>,
): void {
	const pkgJsonPath = join(pkgPath, "package.json")

	if (!existsSync(pkgJsonPath)) {
		return
	}

	try {
		const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8")) as Record<
			string,
			unknown
		>
		const version = typeof pkg.version === "string" ? pkg.version : "?"
		const key = `${name}@${version}`

		if (seen.has(key)) {
			return
		}

		seen.add(key)

		packages.push({
			license: readLicense(pkg),
			name,
			version,
		})

		const nested = join(pkgPath, "node_modules")

		if (existsSync(nested)) {
			packages.push(...collectPackages(nested, seen))
		}
	} catch {
		// skip invalid package.json
	}
}

const nm = join(root, "node_modules")

if (!existsSync(nm)) {
	console.error("node_modules not found. Run 'bun install' first.")
	process.exit(1)
}

console.error("Scanning dependencies for copyleft licenses...")
console.error("")

const packages = collectPackages(nm, new Set<string>())
packages.sort((a, b) => a.name.localeCompare(b.name))

const strong = packages.filter((p) => isMatch(p.license, STRONG_COPYLEFT))
const weak = packages.filter((p) => isMatch(p.license, WEAK_COPYLEFT))
const unknown = packages.filter((p) => p.license === "UNLICENSED")
const permissive = packages.filter(
	(p) =>
		!isMatch(p.license, STRONG_COPYLEFT) &&
		!isMatch(p.license, WEAK_COPYLEFT) &&
		p.license !== "UNLICENSED",
)

const SEP = "─".repeat(60)

console.error(`Dependency License Summary`)
console.error(SEP)
console.error(`  Total dependencies:  ${String(packages.length)}`)
console.error(`  Permissive:          ${String(permissive.length)}`)
console.error(`  Weak copyleft:       ${String(weak.length)}`)
console.error(`  Strong copyleft:     ${String(strong.length)}`)
console.error(`  Unknown/unlicensed:  ${String(unknown.length)}`)
console.error("")

if (strong.length > 0) {
	console.error(`STRONG COPYLEFT FOUND — incompatible with FSL:`)
	console.error(SEP)

	for (const p of strong) {
		console.error(`  ❌ ${p.name}@${p.version} (${p.license})`)
	}

	console.error("")
}

if (weak.length > 0) {
	console.error(`WEAK COPYLEFT FOUND — review terms for FSL compatibility:`)
	console.error(SEP)

	for (const p of weak) {
		console.error(`  ⚠️  ${p.name}@${p.version} (${p.license})`)
	}

	console.error("")
}

if (unknown.length > 0) {
	console.error(`UNKNOWN / UNLICENSED — manual review recommended:`)
	console.error(SEP)

	for (const p of unknown.slice(0, 20)) {
		console.error(`  ℹ️  ${p.name}@${p.version}`)
	}

	if (unknown.length > 20) {
		console.error(`  ... and ${String(unknown.length - 20)} more`)
	}

	console.error("")
}

console.error(SEP)

if (strong.length > 0) {
	console.error(
		"RESULT: ❌ FSL cannot be used — resolve strong copyleft dependencies first.",
	)
	console.error(
		"  Options: replace the dependency, relicense it, or seek an alternative.",
	)
} else if (weak.length > 0) {
	console.error(
		"RESULT: ⚠️  No strong copyleft found, but weak copyleft present.",
	)
	console.error(
		"  Review whether your usage complies with each license's terms.",
	)
} else {
	console.error(
		"RESULT: ✅ No copyleft licenses detected — FSL is compatible.",
	)
}
