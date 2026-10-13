import { task } from "@engine/tooling";
import { tools } from "../core/index.ts";
import { rules } from "./rules.ts";

task(import.meta.url, () => {

    tools.checkArchitecture(rules);

});
