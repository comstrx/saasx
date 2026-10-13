import { parseInteger } from "@engine/parse";
import { report, task } from "@engine/tooling";
import { $ } from "bun";

const app = process.env.APP_ID ?? "com.zainlak.app";
const activity = process.env.APP_ACTIVITY ?? ".MainActivity";
const landing = process.env.LANDING ?? "dashboard-table";
const maestro = process.env.MAESTRO ?? "maestro";
const coldBudgetMs = parseInteger(process.env.COLD_MS ?? "") ?? 1500;
const jankBudgetPercent = Number(process.env.JANK_PERCENT ?? "1");
const coldRuns = parseInteger(process.env.COLD_RUNS ?? "") ?? 3;
const jankRuns = parseInteger(process.env.JANK_RUNS ?? "") ?? 3;
const root = new URL("../..", import.meta.url).pathname;

function environment ( extra: Record<string, string> ): string[] {

    return Object.entries({ APP_ID: app, LANDING: landing, ...extra }).flatMap(( [key, value] ) => ["--env", `${key}=${value}`]);

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
    await flow("scroll");

    const output = await $`adb shell dumpsys gfxinfo ${app}`.text();
    const frames = Number(/Total frames rendered:\s*(\d+)/.exec(output)?.[1] ?? "0");
    const janky = Number(/Janky frames:\s*(\d+)/.exec(output)?.[1] ?? "0");

    if ( !frames ) throw new Error("No frames rendered; is the app in the foreground?");

    return { frames, janky, percent: Math.round((janky / frames) * 10000) / 100 };

}
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
type Measure = { app: string; cold: number; percent: number; frames: number };

async function launcherOf ( pkg: string ): Promise<string> {

    const brief = (await $`adb shell cmd package resolve-activity --brief ${pkg}`.text()).trim().split("\n").pop() ?? "";

    if ( !brief.includes("/") ) throw new Error(`No launcher activity for ${pkg}`);

    return brief;

}
async function coldOf ( component: string, pkg: string, runs: number ): Promise<number> {

    const times: number[] = [];

    for ( let run = 0; run < runs; run += 1 ) {

        await $`adb shell am force-stop ${pkg}`.quiet();
        await Bun.sleep(1500);

        const output = await $`adb shell am start -W -n ${component}`.text();
        const total = /TotalTime:\s*(\d+)/.exec(output)?.[1];

        if ( !total ) throw new Error(`No TotalTime for ${pkg}`);

        times.push(Number(total));
        await Bun.sleep(2500);

    }

    times.sort(( a, b ) => a - b);

    return times[Math.floor(times.length / 2)] ?? 0;

}
async function swipedFrames ( pkg: string ): Promise<Frames> {

    await Bun.sleep(3000);
    await $`adb shell dumpsys gfxinfo ${pkg} reset`.quiet();

    for ( const [from, to] of [[1800, 600], [1800, 600], [1800, 600], [600, 1800], [600, 1800], [600, 1800]] ) {

        await $`adb shell input swipe 540 ${from} 540 ${to} 400`.quiet();
        await Bun.sleep(500);

    }

    const output = await $`adb shell dumpsys gfxinfo ${pkg}`.text();
    const frames = Number(/Total frames rendered:\s*(\d+)/.exec(output)?.[1] ?? "0");
    const janky = Number(/Janky frames:\s*(\d+)/.exec(output)?.[1] ?? "0");

    return { frames, janky, percent: frames ? Math.round((janky / frames) * 10000) / 100 : 0 };

}
export async function compare (): Promise<void> {

    const apps = (process.env.COMPARE ?? "com.whatsapp,org.telegram.messenger,com.airbnb.android,com.booking").split(",").map(( name ) => name.trim()).filter(Boolean);
    const rows: Measure[] = [];

    for ( const pkg of [app, ...apps] ) {

        const component = await launcherOf(pkg);
        const cold = await coldOf(component, pkg, coldRuns);
        const frames = await swipedFrames(pkg);

        rows.push({ app: pkg, cold, percent: frames.percent, frames: frames.frames });
        await $`adb shell am force-stop ${pkg}`.quiet();

    }

    report("app                              cold start (ms)   janky frames while scrolling");

    for ( const row of rows ) report(`${row.app.padEnd(32)} ${String(row.cold).padStart(8)}          ${row.percent}% of ${row.frames}`);

}
task(import.meta.url, async () => {

    const [command = "perf", ...names] = process.argv.slice(2);

    if ( command === "perf" ) return perf();
    if ( command === "compare" ) return compare();

    if ( command === "flow" ) {

        for ( const name of names ) await flow(name, Object.fromEntries(Object.entries(process.env).filter(( [key] ) => /^(ADMIN_EMAIL|ADMIN_PASSWORD|OTP|ROW_TEXT|LANDING)$/.test(key)).map(( [key, value] ) => [key, value ?? ""])));

        return;

    }

    throw new Error(`unknown command ${command}; use perf, compare or flow <name...>`);

});
