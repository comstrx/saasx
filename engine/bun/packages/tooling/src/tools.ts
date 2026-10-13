import { resolve } from "node:path";
import process from "node:process";
import { inspect, layoutIssues, type Rules, readSources } from "./architecture.ts";
import { type Core, createCore, report } from "./core.ts";
import { composeMessages, type Dictionaries } from "./messages.ts";
import { createLoader, type Loader, type LoaderOptions } from "./specs.ts";

export type ToolsOptions<C, L extends string> = Omit<LoaderOptions<C, L>, "root"> & { root: URL | string };
export type Tools<C, L extends string> = Core & {
    loader: Loader<C, L>;
    composeMessages: (brand?: string) => Dictionaries<L>;
    checkMessages: () => void;
    checkSpecs: () => Promise<void>;
    checkArchitecture: (rules: Rules) => void;
};

/**
 * One part's whole tool belt: rooted writers, the spec loader, message composition and the three
 * checks every part runs in `check`.
 */
export function createTools<
    C extends { schema: { screens: unknown[]; features: string[]; operations: string[] } },
    L extends string,
>(options: ToolsOptions<C, L>): Tools<C, L> {
    const core = createCore(options.root);
    const loader = createLoader<C, L>({ ...options, root: core.root });
    const messages = (brand?: string): Dictionaries<L> =>
        composeMessages({ core: resolve(core.root, "messages"), brand, locales: options.locales });

    return {
        ...core,
        loader,
        composeMessages: messages,
        checkMessages: () => {
            messages();
            report("Messages: every language has the same complete key set.");
        },
        checkSpecs: async () => {
            const selected = loader.specFromEnvironment();

            for (const name of loader.installedSpecs()) {
                const { screens, features, operations } = (await loader.loadSpec(name)).schema;
                const chosen = name === selected ? " (selected)" : "";

                report(
                    `Spec: ${name} — ${screens.length} screen(s), ${features.length} feature(s), ${operations.length} operation(s)${chosen}.`,
                );
            }
        },
        checkArchitecture: (rules) => {
            const problems = [...inspect(readSources(rules), rules), ...layoutIssues(rules)];

            report(problems.length ? problems.join("\n") : "Architecture: layers, imports and cycles passed.");
            process.exitCode = problems.length ? 1 : 0;
        },
    };
}
