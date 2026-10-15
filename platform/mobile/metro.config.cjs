const { existsSync, readFileSync, realpathSync } = require("node:fs");
const { dirname, resolve, sep } = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const root = __dirname;
const engine = dirname(realpathSync(require.resolve("engine/package.json", { paths: [root] })));
const mode = process.env.NODE_ENV === "production" ? "production" : "development";
const metaPath = resolve(root, "node_modules/.cache/spec", mode, "meta.json");

if ( !existsSync(metaPath) ) throw new Error(`No compiled spec for ${mode}: run \`bun tools/compile/index.ts ${mode}\` first.`);

const meta = JSON.parse(readFileSync(metaPath, "utf8"));
const declared = Object.keys(JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")).dependencies ?? {});
const host = ( name ) => /^(engine|react|react-dom|react-native|react-native-.*|expo|expo-.*|@expo\/.*|@react-native\/.*|@react-native-.*)$/.test(name);
const aliases = Object.fromEntries(Object.entries(meta.aliases).map(( [name, path] ) => [name, resolve(root, path)]));
const config = getDefaultConfig(root);

config.watchFolders = [...(config.watchFolders ?? []), engine];
config.transformer.getTransformOptions = async () => ({ transform: { experimentalImportSupport: true, inlineRequires: true } });

const unreached = [/\/zod\/v4\/locales\/index\.c?js$/, /\/zod\/v4\/core\/(?:json-schema-processors|json-schema-generator|to-json-schema|compile)\.c?js$/];

config.resolver.resolveRequest = ( context, moduleName, platform ) => {
    const aliased = aliases[moduleName];

    if ( aliased ) return { type: "sourceFile", filePath: aliased };
    if ( context.originModulePath.includes("/zod/") && unreached.some(( file ) => file.test(resolve(context.originModulePath, "..", moduleName))) ) return { type: "empty" };

    const bare = !moduleName.startsWith(".") && !moduleName.startsWith("/");
    const fromEngine = context.originModulePath.startsWith(`${engine}${sep}`);

    if ( bare && fromEngine ) {
        const name = moduleName.startsWith("@") ? moduleName.split("/").slice(0, 2).join("/") : moduleName.split("/")[0];

        if ( !host(name) ) return context.resolveRequest(context, moduleName, platform);
        if ( !declared.includes(name) ) throw new Error(`The engine reaches ${name}, a host package; declare it in package.json so one copy is bundled.`);

        return context.resolveRequest({ ...context, originModulePath: resolve(root, "package.json") }, moduleName, platform);
    }

    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
