import { task } from "@engine/tooling";
import { tools } from "../core/index.ts";

task(import.meta.url, tools.checkSpecs);
