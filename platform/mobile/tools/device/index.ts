import { $ } from "bun";
import { parseInteger } from "engine/parse";
import { report, task } from "engine/tooling";

function need ( name: string ): string {

    const value = process.env[name];

    if ( !value ) throw new Error(`${name} names the app under test; set it before measuring.`);

    return value;

}

const app = need("APP_PACKAGE");
const activity = process.env.APP_ACTIVITY ?? ".MainActivity";
const landing = need("LANDING");
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
    const share = `${frames.janky} of ${frames.frames} (${frames.percent}%, budget ${jankBudgetPercent}%)`;
    const lines = [
        `cold start to first frame, median of ${coldRuns}: ${cold} ms (budget ${coldBudgetMs} ms)`,
        `janky frames while scrolling, median of ${jankRuns} [${frames.runs.join(", ")}]: ${share}`,
    ];

    for ( const line of lines ) report(line);

    const failures = [
        ...(cold > coldBudgetMs ? [`cold start ${cold} ms over ${coldBudgetMs} ms`] : []),
        ...(frames.percent > jankBudgetPercent ? [`jank ${frames.percent}% over ${jankBudgetPercent}%`] : []),
    ];

    if ( failures.length ) throw new Error(failures.join("; "));

}
type Point = readonly [number, number];
type Plan = { app: string; tabs?: readonly [Point, Point] | undefined };
type Graphics = Frames & { p50: number; p90: number; p99: number };
type Measure = { app: string; cold: number; scroll: Graphics; nav: Graphics | null; pss: number[] };

const loops = parseInteger(process.env.NAV_LOOPS ?? "") ?? 20;

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
async function graphics ( pkg: string, act: () => Promise<void> ): Promise<Graphics> {

    await $`adb shell dumpsys gfxinfo ${pkg} reset`.quiet();
    await act();

    const output = await $`adb shell dumpsys gfxinfo ${pkg}`.text();
    const number = ( pattern: RegExp ): number => Number(pattern.exec(output)?.[1] ?? "0");
    const frames = number(/Total frames rendered:\s*(\d+)/);
    const janky = number(/Janky frames:\s*(\d+)/);

    return {
        frames,
        janky,
        percent: frames ? Math.round((janky / frames) * 10000) / 100 : 0,
        p50: number(/50th percentile:\s*(\d+)ms/),
        p90: number(/90th percentile:\s*(\d+)ms/),
        p99: number(/99th percentile:\s*(\d+)ms/),
    };

}
async function swipes (): Promise<void> {

    for ( const [from, to] of [[1800, 600], [1800, 600], [1800, 600], [600, 1800], [600, 1800], [600, 1800]] ) {

        await $`adb shell input swipe 540 ${from} 540 ${to} 400`.quiet();
        await Bun.sleep(500);

    }

}
function switches ( tabs: readonly [Point, Point], count: number ): () => Promise<void> {

    return async () => {

        for ( let run = 0; run < count; run += 1 ) {

            for ( const [x, y] of tabs ) {

                await $`adb shell input tap ${x} ${y}`.quiet();
                await Bun.sleep(700);

            }

        }

    };

}
async function pssOf ( pkg: string ): Promise<number> {

    await Bun.sleep(3000);

    const output = await $`adb shell dumpsys meminfo ${pkg}`.text();

    return Math.round(Number(/TOTAL PSS:\s*(\d+)/.exec(output)?.[1] ?? /TOTAL\s+(\d+)/.exec(output)?.[1] ?? "0") / 1024);

}
async function measure ( plan: Plan ): Promise<Measure> {

    const component = await launcherOf(plan.app);
    const cold = await coldOf(component, plan.app, coldRuns);

    await Bun.sleep(3000);

    const scroll = await graphics(plan.app, swipes);
    const pss = [await pssOf(plan.app)];
    const nav = plan.tabs ? await graphics(plan.app, switches(plan.tabs, loops)) : null;

    if ( plan.tabs ) {

        pss.push(await pssOf(plan.app));
        await switches(plan.tabs, loops)();
        await swipes();
        pss.push(await pssOf(plan.app));
        await $`adb shell am send-trim-memory ${plan.app} RUNNING_CRITICAL`.quiet().nothrow();
        pss.push(await pssOf(plan.app));

    }

    await $`adb shell am force-stop ${plan.app}`.quiet();

    return { app: plan.app, cold, scroll, nav, pss };

}
function row ( value: Graphics | null ): string {

    return value ? `${value.percent}% of ${value.frames} · p50 ${value.p50} p90 ${value.p90} p99 ${value.p99} ms` : "—";

}
export async function compare (): Promise<Measure[]> {

    const plans: Plan[] = process.env.PLAN
        ? (JSON.parse(await Bun.file(process.env.PLAN).text()) as Plan[])
        : [app, ...(process.env.COMPARE ?? "com.whatsapp,org.telegram.messenger,com.airbnb.android,com.booking").split(",")]
            .map(( name ) => ({ app: name.trim() }))
            .filter(( plan ) => plan.app);
    const rows: Measure[] = [];

    for ( const plan of plans ) rows.push(await measure(plan));

    for ( const entry of rows ) {

        report(`${entry.app}`);
        report(`  cold start ${entry.cold} ms (median of ${coldRuns})`);
        report(`  scroll ${row(entry.scroll)}`);
        report(`  tabs   ${row(entry.nav)}`);
        report(`  PSS    ${entry.pss.join(" → ")} MB (warm, after tabs, after tabs and scroll, after a memory trim)`);

    }

    if ( process.env.OUT ) await Bun.write(process.env.OUT, JSON.stringify(rows, null, 2));

    return rows;

}
task(import.meta.url, async () => {

    const [command = "perf", ...names] = process.argv.slice(2);

    if ( command === "perf" ) return perf();
    if ( command === "compare" ) {

        await compare();

        return;

    }

    if ( command === "flow" ) {

        const inputs = Object.fromEntries(
            Object.entries(process.env)
                .filter(( [key] ) => /^(ADMIN_EMAIL|ADMIN_PASSWORD|OTP|ROW_TEXT|LANDING)$/.test(key))
                .map(( [key, value] ) => [key, value ?? ""]),
        );

        for ( const name of names ) await flow(name, inputs);

        return;

    }

    throw new Error(`unknown command ${command}; use perf, compare or flow <name...>`);

});
