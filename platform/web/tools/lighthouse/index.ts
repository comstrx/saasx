import { readFileSync } from "node:fs";
import { report, task } from "@engine/tooling";

type Report = { categories: Record<string, { score: number | null }> };

const defaults: Record<string, number> = { performance: 90, accessibility: 100, "best-practices": 90, seo: 90 };

task(import.meta.url, async () => {

    const [path, ...given] = process.argv.slice(2);

    if ( !path ) throw new Error("Give the Lighthouse JSON report path.");

    const floors = { ...defaults, ...Object.fromEntries(given.map(( pair ) => { const [name, value] = pair.split("="); return [name ?? "", Number(value)]; })) };

    const { categories } = JSON.parse(readFileSync(path, "utf8")) as Report;
    const failures: string[] = [];

    for ( const [name, floor] of Object.entries(floors) ) {

        const score = Math.round((categories[name]?.score ?? 0) * 100);

        report(`${name.padEnd(16)} ${String(score).padStart(3)} / ${floor}`);

        if ( score < floor ) failures.push(`${name} ${score} < ${floor}`);

    }

    if ( failures.length ) throw new Error(`Lighthouse below the floor: ${failures.join(", ")}.`);

});
