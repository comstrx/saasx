import { catalogueFacts } from "@engine/spec";
import { createTools, type Loaded } from "@engine/tooling";
import { endpoints } from "../../src/api/features/index.ts";
import { type Locale, supportedLocales } from "../../src/lib/spec/languages.ts";
import { type Compiled, validateSpec } from "../../src/lib/spec/surface.ts";
import { brandFolders } from "../assets/index.ts";

export type Spec = Loaded<Compiled, Locale>;

export const tools = createTools<Compiled, Locale>({
    root: new URL("../..", import.meta.url),
    variable: "EXPO_PUBLIC_SPEC",
    locales: supportedLocales,
    brandFolders,
    catalogue: catalogueFacts(endpoints),
    validate: validateSpec,
});
export const { root, writeFile, writeJson, composeMessages } = tools;
export const { installedSpecs, selectSpec, specFromEnvironment, loadSpec } = tools.loader;
