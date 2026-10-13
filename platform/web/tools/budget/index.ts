import { formatBytes, parseInteger } from "@engine/parse";
import { report, task } from "@engine/tooling";

type Asset = { url: string; bytes: number };

const base = process.env.BUDGET_URL ?? "http://127.0.0.1:3001";
const path = process.env.BUDGET_PATH ?? "/login";
const limit = parseInteger(process.env.BUDGET_KB ?? "") ?? 310;

async function size ( url: string ): Promise<number> {

    const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer());

    return Bun.gzipSync(bytes).byteLength;

}
export async function measure (): Promise<{ assets: Asset[]; total: number }> {

    const html = await (await fetch(`${base}${path}`)).text();
    const scripts = [...new Set([...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map(( match ) => match[1] ?? ""))];
    const assets = await Promise.all(scripts.map(async ( url ) => ({ url, bytes: await size(`${base}${url}`) })));

    return { assets: assets.sort(( a, b ) => b.bytes - a.bytes), total: assets.reduce(( sum, asset ) => sum + asset.bytes, 0) };

}

task(import.meta.url, async () => {

    const { assets, total } = await measure();

    for ( const asset of assets ) report(`${formatBytes(asset.bytes).padStart(10)}  ${asset.url}`);

    report(`First-load JavaScript of ${path}: ${formatBytes(total)} over ${assets.length} script(s); budget ${limit} KB.`);

    if ( total > limit * 1024 ) throw new Error(`Over budget by ${formatBytes(total - limit * 1024)}.`);

});
