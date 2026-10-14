import { readFileSync } from "node:fs";
import { report, task } from "@engine/tooling";

type Report = { categories: Record<string, { score: number | null }> };

const defaults: Record<string, number> = { performance: 90, accessibility: 100, "best-practices": 90, seo: 90 };

export function medianScores ( reports: readonly Report[] ): Record<string, number> {

    const names = [...new Set(reports.flatMap(( entry ) => Object.keys(entry.categories)))];

    return Object.fromEntries(names.map(( name ) => {

        const scores = reports.map(( entry ) => Math.round((entry.categories[name]?.score ?? 0) * 100)).sort(( a, b ) => a - b);

        return [name, scores[Math.floor((scores.length - 1) / 2)] ?? 0];

    }));

}

task(import.meta.url, async () => {

    const given = process.argv.slice(2);
    const paths = given.filter(( entry ) => !entry.includes("="));

    if ( !paths.length ) throw new Error("Give one or more Lighthouse JSON report paths.");

    const floors = { ...defaults, ...Object.fromEntries(given.filter(( entry ) => entry.includes("=")).map(( pair ) => { const [name, value] = pair.split("="); return [name ?? "", Number(value)]; })) };
    const scores = medianScores(paths.map(( path ) => JSON.parse(readFileSync(path, "utf8")) as Report));
    const failures: string[] = [];

    for ( const [name, floor] of Object.entries(floors) ) {

        const score = scores[name] ?? 0;

        report(`${name.padEnd(16)} ${String(score).padStart(3)} / ${floor} (median of ${paths.length})`);

        if ( score < floor ) failures.push(`${name} ${score} < ${floor}`);

    }

    if ( failures.length ) throw new Error(`Lighthouse below the floor: ${failures.join(", ")}.`);

});
