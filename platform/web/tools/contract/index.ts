import { resolve } from "node:path";
import { compare, readJson, report, root, task, writeJson } from "../core/index.ts";
import { recordSamples } from "./record.ts";
import { absentFields, fixture, type Samples, sampleIssues } from "./verify.ts";

function setting ( name: string ): string {

    const value = process.env[name];

    if ( !value ) throw new Error(`Recording needs ${name}.`);

    return value;

}
function verify (): void {

    const issues = sampleIssues(readJson<Samples>(resolve(root, fixture)));

    report(issues.length ? issues.join("\n") : "Contract samples: every recorded payload decodes.");
    process.exitCode = issues.length ? 1 : 0;

}
async function record (): Promise<void> {

    const target = { api: setting("CONTRACT_API"), tenant: setting("CONTRACT_TENANT") };
    const { samples, skipped } = await recordSamples(target, setting("CONTRACT_OTP"));

    const absent = absentFields(samples);

    writeJson(fixture, Object.fromEntries(Object.entries(samples).sort(( [a], [b] ) => compare(a, b))));
    report(`Recorded ${Object.keys(samples).length} samples, skipped ${skipped.length}:\n${skipped.join("\n")}`);
    report(`Fields the core reads that no sample carries (renamed or dropped?): ${absent.length}\n${absent.join("\n")}`);
    verify();

}
async function run (): Promise<void> {

    if ( process.argv[2] === "record" ) await record();
    else verify();

}

task(import.meta.url, run);
