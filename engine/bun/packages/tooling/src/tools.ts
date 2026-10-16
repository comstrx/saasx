import { resolve } from "node:path";
import process from "node:process";
import { ruleNames } from "engine/validate";
import { inspect, layoutIssues, type Rules, readSources, type SurfaceRules } from "./architecture.ts";
import { type AssetFolder, assetFiles, composeAssets, type Files, type Skip } from "./assets.ts";
import { type Buildable, type BuildPlan, type Compile, defineBuild } from "./build.ts";
import { generatedRoot } from "./compile.ts";
import { type Core, createCore, report, tally } from "./core.ts";
import { composeMessages, type Dictionaries, messageIssues } from "./messages.ts";
import { defineRules } from "./rules.ts";
import { createLoader, type Loader, type LoaderOptions } from "./specs.ts";

export type ToolsOptions<C, L extends string> = Omit<LoaderOptions<C, L>, "root" | "brandFolders"> & {
    root: URL | string;
    reasons?: readonly string[] | undefined;
    assets: readonly AssetFolder[];
    architecture: Omit<SurfaceRules, "root">;
};
export type SurfaceAssets = {
    paths: string[];
    brandFolders: string[];
    files: ( folder: string, publicFiles?: boolean ) => Files;
    compose: ( publicFolder: string, brand: string ) => Files;
};
export type Tools<C, L extends string> = Core & {
    loader: Loader<C, L>;
    composeMessages: ( brand?: string ) => Dictionaries<L>;
    checkMessages: () => void;
    checkSpecs: () => Promise<void>;
    checkArchitecture: ( rules: Rules ) => void;
    assets: SurfaceAssets;
    rules: Rules;
    check: () => Promise<void>;
    build: ( url: string, plan: BuildPlan<C & Buildable, L> ) => Compile;
};

const generatedFolder = generatedRoot.slice(generatedRoot.lastIndexOf("/") + 1);

function surfaceAssets ( folders: readonly AssetFolder[] ): SurfaceAssets {

    const paths = folders.map(( folder ) => folder.path);
    const skip: Skip = ( name, base, publicFiles ) =>
        base === generatedFolder || (base.startsWith(".") && !(publicFiles && paths.includes(name)));

    return {
        paths,
        brandFolders: [...folders.map(( folder ) => folder.brand), "messages"],
        files: ( folder, publicFiles = false ) => assetFiles(folder, skip, publicFiles),
        compose: ( publicFolder, brand ) => composeAssets(folders, publicFolder, brand, skip),
    };

}

export function createTools<
    C extends { schema: { screens: unknown[]; features: string[]; operations: string[] } },
    L extends string,
> ( options: ToolsOptions<C, L> ): Tools<C, L> {

    const core = createCore(options.root);
    const assets = surfaceAssets(options.assets);
    const rules = defineRules({ ...options.architecture, root: core.root });
    const loader = createLoader<C, L>({ ...options, root: core.root, brandFolders: assets.brandFolders });
    const messages = ( brand?: string ): Dictionaries<L> =>
        composeMessages({ core: resolve(core.root, "messages"), brand, locales: options.locales });

    const checkArchitecture = ( chosen: Rules ): void => {

        const problems = [...inspect(readSources(chosen), chosen), ...layoutIssues(chosen)];

        report(problems.length ? problems.join("\n") : "Architecture: layers, imports and cycles passed.");
        process.exitCode = problems.length ? 1 : 0;

    };
    const checkMessages = (): void => {

        const problems = messageIssues(messages(), { reasons: options.reasons ?? [], rules: ruleNames });

        if ( problems.length ) throw new Error(problems.join("\n"));

        report("Messages: every language has the same complete key set and every reason and rule speaks.");

    };
    const checkSpecs = async (): Promise<void> => {

        const selected = loader.specFromEnvironment();

        for ( const name of loader.installedSpecs() ) {

            const { schema } = await loader.loadSpec(name);
            const chosen = name === selected ? " (selected)" : "";

            report(`Spec: ${name} — ${tally(schema)}${chosen}.`);

        }

    };

    const tools: Tools<C, L> = {
        ...core,
        loader,
        assets,
        rules,
        checkArchitecture,
        checkMessages,
        checkSpecs,
        check: async () => {

            checkArchitecture(rules);
            checkMessages();
            await checkSpecs();

        },
        composeMessages: messages,
        build: ( url, plan ) => defineBuild<C & Buildable, L>({ ...tools, loader: tools.loader as Loader<C & Buildable, L> }, url, plan),
    };

    return tools;

}
