import process from "node:process";
import { $ } from "bun";
import { changelog, type Manifest, type Manifests, packOrder, versioned } from "./lib.ts";

const root = new URL("../..", import.meta.url).pathname.replace(/\/$/, "");
const out = `${root}/.release`;
const [command = "dry", argument] = process.argv.slice(2);

async function manifests(): Promise<Manifests> {
    const glob = new Bun.Glob("packages/*/package.json");
    const found: Manifests = {};

    for await (const path of glob.scan({ cwd: root }))
        found[path] = (await Bun.file(`${root}/${path}`).json()) as Manifest;

    return found;
}
async function write(path: string, manifest: Manifest): Promise<void> {
    await Bun.write(`${root}/${path}`, `${JSON.stringify(manifest, null, 4)}\n`);
}
async function lastTag(): Promise<string | undefined> {
    const tags = (await $`git tag --list "engine/v*" --sort=-v:refname`.cwd(root).text()).trim();

    return tags.split("\n").find(Boolean);
}
async function currentVersion(): Promise<string> {
    const manifest = (await Bun.file(`${root}/package.json`).json()) as Manifest;

    return manifest.version;
}
async function section(version: string): Promise<string> {
    const since = await lastTag();
    const range = since ? `${since}..HEAD` : "HEAD";
    const lines = (await $`git log --no-merges --format=%h%x20%s ${range} -- .`.cwd(root).text())
        .split("\n")
        .filter(Boolean);

    return changelog(version, new Date().toISOString().slice(0, 10), lines);
}
async function pack(order: string[], found: Manifests): Promise<string[]> {
    await $`rm -rf ${out}`.quiet();
    await $`mkdir -p ${out}`.quiet();

    const paths: string[] = [];

    for (const name of order) {
        const [path] = Object.entries(found).find(([, manifest]) => manifest.name === name) ?? [];

        if (!path) continue;

        const folder = `${root}/${path.replace(/\/package.json$/, "")}`;
        const file = (await $`bun pm pack --quiet --destination ${out}`.cwd(folder).text()).trim();

        paths.push(`${out}/${file.split("/").pop() ?? file}`);
        console.log(`packed ${name} -> ${file}`);
    }

    return paths;
}
/**
 * A fresh consumer outside the workspace installs every tarball by file path, imports the engine
 * through its published names, typechecks and runs. What passes here extracts to ToolX as is.
 */
async function smoke(found: Manifests, tarballs: string[]): Promise<void> {
    const home = `${out}/consumer`;
    const dependencies = Object.fromEntries(
        Object.values(found).map((manifest) => {
            const file = tarballs.find((path) => path.includes(`${manifest.name.replace("@engine/", "engine-")}-`));

            if (!file) throw new Error(`No tarball for ${manifest.name}`);

            return [manifest.name, `file:${file}`];
        }),
    );

    await $`rm -rf ${home}`.quiet();
    await $`mkdir -p ${home}`.quiet();
    await Bun.write(
        `${home}/package.json`,
        JSON.stringify(
            {
                name: "consumer",
                private: true,
                type: "module",
                dependencies,
                overrides: dependencies,
                devDependencies: { typescript: "7.0.2", "@types/bun": "1.4.2", "@types/react": "19.3.0" },
            },
            null,
            4,
        ),
    );
    await Bun.write(
        `${home}/tsconfig.json`,
        JSON.stringify(
            {
                compilerOptions: {
                    target: "ES2024",
                    module: "ESNext",
                    moduleResolution: "bundler",
                    strict: true,
                    noEmit: true,
                    skipLibCheck: true,
                    allowImportingTsExtensions: true,
                    types: ["bun"],
                    jsx: "react-jsx",
                },
                include: ["smoke.ts"],
            },
            null,
            4,
        ),
    );
    await Bun.write(
        `${home}/smoke.ts`,
        `import { get, many, z } from "@engine/api";
import { createForm } from "@engine/context";
import { Failure } from "@engine/error";
import { catalogueFacts, transportIssues } from "@engine/spec";
import { fieldFacts } from "@engine/validate";

const item = z.object({ id: z.number(), name: z.string().min(2) });
const facts = catalogueFacts({ products: { list: get("/products", { limit: z.number().optional() }, many(item)) } });
const fields = fieldFacts(z.object({ address: z.object({ city: z.string() }) }));
const form = createForm({ fields, locales: ["en"], submit: async (values) => values });
const issues = transportIssues({ urls: { production: "http://a.test", local: null }, options: { prefix: "" } });

if (facts.products?.list?.many !== true) throw new Failure("configuration", { message: "facts" });
if (fields[0]?.name !== "address.city") throw new Failure("configuration", { message: "fields" });
if (!issues.length) throw new Failure("configuration", { message: "transport" });

form.getState().set("address.city", "Cairo");
await form.getState().submit();
if (JSON.stringify(form.getState().result) !== '{"address":{"city":"Cairo"}}') throw new Failure("configuration", { message: "form" });
console.log("smoke: engine packages import, typecheck and run outside the workspace");
`,
    );
    await $`bun install --no-save`.cwd(home).env({ ...process.env, BUN_CONFIG_NO_CLEAR_TERMINAL_SCREEN: "1" });
    await $`bunx tsc -p tsconfig.json`.cwd(home);
    await $`bun run smoke.ts`.cwd(home);
}

const found = await manifests();
const order = packOrder(found);

switch (command) {
    case "version": {
        if (!argument) throw new Error("usage: release version <x.y.z>");

        for (const [path, manifest] of Object.entries(versioned(found, argument))) await write(path, manifest);

        const rootManifest = (await Bun.file(`${root}/package.json`).json()) as Manifest;

        await write("package.json", { ...rootManifest, version: argument });
        console.log(`engine ${argument}: ${Object.keys(found).length} packages`);
        break;
    }
    case "changelog": {
        const version = argument ?? (await currentVersion());
        const text = await section(version);
        const existing = (await Bun.file(`${root}/CHANGELOG.md`).exists())
            ? await Bun.file(`${root}/CHANGELOG.md`).text()
            : "# Engine changelog\n\n";

        await Bun.write(`${root}/CHANGELOG.md`, `${existing.trimEnd()}\n\n${text}`);
        console.log(text);
        break;
    }
    case "tag": {
        const version = await currentVersion();

        await $`git tag -a engine/v${version} -m ${`engine ${version}`}`.cwd(root);
        console.log(`tagged engine/v${version}`);
        break;
    }
    case "pack": {
        await pack(order, found);
        break;
    }
    case "dry": {
        console.log(await section(await currentVersion()));
        await smoke(found, await pack(order, found));
        break;
    }
    default:
        throw new Error(`unknown command ${command}; use version, changelog, tag, pack or dry`);
}
