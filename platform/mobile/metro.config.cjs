const { existsSync, readFileSync, readdirSync } = require("node:fs");
const { resolve } = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const root = __dirname;
const engine = resolve(root, "../../engine/bun");
const mode = process.env.NODE_ENV === "production" ? "production" : "development";
const metaPath = resolve(root, "node_modules/.cache/spec", mode, "meta.json");

if ( !existsSync(metaPath) ) throw new Error(`No compiled spec for ${mode}: run \`bun tools/compile/index.ts ${mode}\` first.`);

const meta = JSON.parse(readFileSync(metaPath, "utf8"));
const declared = Object.keys(JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")).dependencies ?? {});
const aliases = {
    ...Object.fromEntries(Object.entries(meta.aliases).map(( [name, path] ) => [name, resolve(root, path)])),
    ...Object.fromEntries(readdirSync(resolve(engine, "packages")).map(( name ) => [`@engine/${name}`, resolve(engine, "packages", name, "src/index.ts")])),
};
const config = getDefaultConfig(root);

config.watchFolders = [...(config.watchFolders ?? []), engine];
config.resolver.resolveRequest = ( context, moduleName, platform ) => {

    const aliased = aliases[moduleName];

    if ( aliased ) return { type: "sourceFile", filePath: aliased };

    const bare = !moduleName.startsWith(".") && !moduleName.startsWith("/");
    const fromEngine = context.originModulePath.startsWith(engine);

    if ( bare && fromEngine ) {

        const name = moduleName.startsWith("@") ? moduleName.split("/").slice(0, 2).join("/") : moduleName.split("/")[0];

        if ( !declared.includes(name) ) throw new Error(`The engine imports ${name}; declare it in package.json so one copy is bundled.`);

        return context.resolveRequest({ ...context, originModulePath: resolve(root, "package.json") }, moduleName, platform);

    }

    return context.resolveRequest(context, moduleName, platform);

};

module.exports = config;
