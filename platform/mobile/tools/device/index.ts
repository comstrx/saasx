import { parseInteger } from "@engine/parse";
import { report, task } from "@engine/tooling";
import { $ } from "bun";

/**
 * The phone as a gate: Maestro flows drive the installed lab build, and `perf` measures what a
 * user feels, cold start to the first frame and janky frames while scrolling, against budgets.
 */
const app = process.env.APP_ID ?? "com.zainlak.app";
const activity = process.env.APP_ACTIVITY ?? ".MainActivity";
const maestro = process.env.MAESTRO ?? "maestro";
const coldBudgetMs = parseInteger(process.env.COLD_MS ?? "") ?? 1500;
const jankBudgetPercent = Number(process.env.JANK_PERCENT ?? "1");
const coldRuns = parseInteger(process.env.COLD_RUNS ?? "") ?? 3;
const jankRuns = parseInteger(process.env.JANK_RUNS ?? "") ?? 3;
const root = new URL("../..", import.meta.url).pathname;

function environment ( extra: Record<string, string> ): string[] {

    return Object.entries({ APP_ID: app, ...extra }).flatMap(( [key, value] ) => ["--env", `${key}=${value}`]);

}
export async function flow ( name: string, extra: Record<string, string> = {} ): Promise<void> {

    const file = `${root}flows/${name}.yaml`;

    report(`flow ${name}`);
    await $`${maestro} test ${environment(extra)} ${file}`.env({ ...process.env, MAESTRO_CLI_NO_ANALYTICS: "1" });

}
async function coldStart (): Promise<number> {

    const times: number[] = [];

    for ( let run = 0; run < coldRuns; run += 1 ) {

        await $`adb shell am force-stop ${app}`.quiet();
        await Bun.sleep(1500);

        const output = await $`adb shell am start -W -n ${app}/${activity}`.text();
        const total = /TotalTime:\s*(\d+)/.exec(output)?.[1];

        if ( !total ) throw new Error(`No TotalTime in: ${output}`);

        times.push(Number(total));
        await Bun.sleep(2500);

    }

    times.sort(( a, b ) => a - b);

    return times[Math.floor(times.length / 2)] ?? 0;

}
type Frames = { frames: number; janky: number; percent: number };

async function scrolled (): Promise<Frames> {

    await $`adb shell dumpsys gfxinfo ${app} reset`.quiet();
    await flow("admin-scroll");

    const output = await $`adb shell dumpsys gfxinfo ${app}`.text();
    const frames = Number(/Total frames rendered:\s*(\d+)/.exec(output)?.[1] ?? "0");
    const janky = Number(/Janky frames:\s*(\d+)/.exec(output)?.[1] ?? "0");

    if ( !frames ) throw new Error("No frames rendered; is the app in the foreground?");

    return { frames, janky, percent: Math.round((janky / frames) * 10000) / 100 };

}
/**
 * One frame is a quarter of a percent over a few hundred frames, so one scroll decides nothing:
 * the gate takes the median of several.
 */
async function jank (): Promise<Frames & { runs: number[] }> {

    const runs: Frames[] = [];

    for ( let run = 0; run < jankRuns; run += 1 ) runs.push(await scrolled());

    runs.sort(( a, b ) => a.percent - b.percent);

    const middle = runs[Math.floor(runs.length / 2)] as Frames;

    return { ...middle, runs: runs.map(( entry ) => entry.percent) };

}
export async function perf (): Promise<void> {

    const cold = await coldStart();
    const frames = await jank();
    const lines = [
        `cold start to first frame, median of ${coldRuns}: ${cold} ms (budget ${coldBudgetMs} ms)`,
        `janky frames while scrolling, median of ${jankRuns} [${frames.runs.join(", ")}]: ${frames.janky} of ${frames.frames} (${frames.percent}%, budget ${jankBudgetPercent}%)`,
    ];

    for ( const line of lines ) report(line);

    const failures = [
        ...(cold > coldBudgetMs ? [`cold start ${cold} ms over ${coldBudgetMs} ms`] : []),
        ...(frames.percent > jankBudgetPercent ? [`jank ${frames.percent}% over ${jankBudgetPercent}%`] : []),
    ];

    if ( failures.length ) throw new Error(failures.join("; "));

}
task(import.meta.url, async () => {

    const [command = "perf", ...names] = process.argv.slice(2);

    if ( command === "perf" ) return perf();
    if ( command === "flow" ) {

        for ( const name of names ) await flow(name, Object.fromEntries(Object.entries(process.env).filter(( [key] ) => /^(ADMIN_EMAIL|ADMIN_PASSWORD|OTP|ROW_TEXT)$/.test(key)).map(( [key, value] ) => [key, value ?? ""])));

        return;

    }

    throw new Error(`unknown command ${command}; use perf or flow <name...>`);

});
