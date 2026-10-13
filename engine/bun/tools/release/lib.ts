export type Manifest = {
    name: string;
    version: string;
    dependencies?: Record<string, string> | undefined;
    [key: string]: unknown;
};
export type Manifests = Record<string, Manifest>;

const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/;
const engineLine = /^([0-9a-f]+) engine\(([a-z0-9-]+)\): (.+)$/;

/**
 * Every manifest at the one engine version: the packages release in lockstep, and workspace links
 * stay as they are because packing resolves them.
 */
export function versioned(manifests: Manifests, version: string): Manifests {
    if (!semver.test(version)) throw new Error(`Not a semver version: ${version}`);

    return Object.fromEntries(Object.entries(manifests).map(([path, manifest]) => [path, { ...manifest, version }]));
}
/**
 * Package names in dependency order: each after every workspace package it depends on, so a
 * consumer can install the tarballs one by one.
 */
export function packOrder(manifests: Manifests): string[] {
    const byName = new Map(Object.values(manifests).map((manifest) => [manifest.name, manifest]));
    const done = new Set<string>();
    const order: string[] = [];
    const visit = (name: string, trail: string[]): void => {
        if (done.has(name)) return;
        if (trail.includes(name)) throw new Error(`Dependency cycle: ${[...trail, name].join(" -> ")}`);

        const manifest = byName.get(name);

        if (!manifest) return;

        for (const dependency of Object.keys(manifest.dependencies ?? {})) {
            if (byName.has(dependency)) visit(dependency, [...trail, name]);
        }

        done.add(name);
        order.push(name);
    };

    for (const name of [...byName.keys()].sort()) visit(name, []);

    return order;
}
/**
 * One changelog section from `git log --oneline` lines: engine commits only, grouped by the
 * package they name. Hashes stay in git: split into letter runs they read as misspelt words to
 * the spelling gate.
 */
export function changelog(version: string, date: string, lines: readonly string[]): string {
    const groups = new Map<string, string[]>();

    for (const line of lines) {
        const match = engineLine.exec(line.trim());

        if (!match) continue;

        const [, , scope, subject] = match;
        const entries = groups.get(scope as string) ?? [];

        entries.push(`- ${subject}`);
        groups.set(scope as string, entries);
    }

    const sections = [...groups.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([scope, entries]) => `### ${scope}\n${entries.join("\n")}`);

    return `## ${version} (${date})\n\n${sections.length ? sections.join("\n\n") : "No engine changes."}\n`;
}
