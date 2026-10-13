import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { promisify } from "node:util";
import type { Tuple } from "@engine/emoji";
import { type Annotations, buildCatalog, catalogModule, keyOf, parseAnnotations, parseEmojiTest, tonedGlyphs } from "./emoji.ts";

export type EmojiSources = { work: string; fluent: string; assets: string; catalog: string; size: number; fps: number; favorites: readonly string[]; limit: number };
export type FluentIndex = Map<string, string>;

const run = promisify(execFile);
const cldr = "https://raw.githubusercontent.com/unicode-org/cldr/main/common";
const texts: Readonly<Record<string, string>> = {
    "emoji-test.txt": "https://unicode.org/Public/emoji/latest/emoji-test.txt",
    "en.xml": `${cldr}/annotations/en.xml`,
    "en-derived.xml": `${cldr}/annotationsDerived/en.xml`,
    "ar.xml": `${cldr}/annotations/ar.xml`,
    "ar-derived.xml": `${cldr}/annotationsDerived/ar.xml`,
};
const animatedTree = "https://api.github.com/repos/microsoft/fluentui-emoji-animated/git/trees/main?recursive=1";
const animatedMedia = "https://media.githubusercontent.com/media/microsoft/fluentui-emoji-animated/main";
const toneFolders = ["Light", "Medium-Light", "Medium", "Medium-Dark", "Dark"];
const favorites = [..."😂❤️🤣👍😭🙏😘🥰😍😊🎉😁💕🥺😅🔥☺️🤦♥️🤷🙄😆🤗😉🎂🤔👏🙂😳🥳😎👌💜😔💪✨💖👀😋😏😢👉💗😩💯🌹💞🎈💙😃😡💐😜🙈🤞😄🤤🙌🤪❣️😀💋💀👇💔😌💓🤩🙃😬😱😴🤭😐🌞😒😇🌸😈🎶✌️🎊🥵😞💚☀️🖤💰😚👑🎁💥🙋☹️😑🥴👈💩✅👋🤝🥲😤🤯🎯🚀⭐🌟💎🏆🍕☕🥹🫶🫠😮😲🤓🥶🤮🤢😷🤒🤕🤠🥸😺🙀🐶🐱🦁🐸🦄🐢🌈🌙⚡❄️🍎🍔🍺🍷🎮⚽🏀🎸🎤📱💡🔔🔒🔑✈️🚗🏠🎄🎃👻🤖👽🎵🥇🏅"].reduce<string[]>(( list, character ) => {

    if ( character === "️" ) list[list.length - 1] += character;
    else list.push(character);

    return list;

}, []);
const license = `Emoji artwork: Microsoft Fluent Emoji (https://github.com/microsoft/fluentui-emoji, https://github.com/microsoft/fluentui-emoji-animated), MIT License, Copyright (c) Microsoft Corporation. The 3D renders were resized and encoded as WebP; the animated set as animated WebP.
Emoji names and keywords in packages/emoji/src/catalog.ts: Unicode Emoji data files and CLDR annotations, Unicode License v3 (https://www.unicode.org/license.txt), Copyright Unicode, Inc.
`;

async function fetchText ( work: string, name: string ): Promise<string> {

    const file = resolve(work, name);

    if ( !existsSync(file) ) {

        const response = await fetch(texts[name] ?? "");

        if ( !response.ok ) throw new Error(`Cannot fetch ${name}: ${response.status}`);

        writeFileSync(file, await response.text());

    }

    return readFileSync(file, "utf8");

}
async function fetchBinary ( file: string, url: string ): Promise<void> {

    if ( existsSync(file) ) return;

    const response = await fetch(url);

    if ( !response.ok ) throw new Error(`Cannot fetch ${url}: ${response.status}`);

    writeFileSync(file, new Uint8Array(await response.arrayBuffer()));

}
function pngIn ( folder: string ): string | undefined {

    if ( !existsSync(folder) ) return undefined;

    const name = readdirSync(folder).find(( entry ) => entry.endsWith(".png"));

    return name ? resolve(folder, name) : undefined;

}
export function fluentIndex ( repo: string ): { statics: FluentIndex; names: Map<string, string> } {

    const statics: FluentIndex = new Map();
    const names = new Map<string, string>();
    const assets = resolve(repo, "assets");

    for ( const name of readdirSync(assets) ) {

        const metaFile = resolve(assets, name, "metadata.json");

        if ( !existsSync(metaFile) ) continue;

        const meta = JSON.parse(readFileSync(metaFile, "utf8")) as { unicode: string; unicodeSkintones?: string[] };
        const key = meta.unicode.split(" ").filter(( code ) => code !== "fe0f").join("-");
        const base = pngIn(resolve(assets, name, "3D")) ?? pngIn(resolve(assets, name, "Default", "3D"));

        names.set(key, name);

        if ( base ) statics.set(key, base);

        for ( const [index, folder] of toneFolders.entries() ) {

            const toned = meta.unicodeSkintones?.[index + 1];
            const file = toned ? pngIn(resolve(assets, name, folder, "3D")) : undefined;

            if ( toned && file ) statics.set(toned.split(" ").filter(( code ) => code !== "fe0f").join("-"), file);

        }

    }

    return { statics, names };

}
async function convert ( input: string, output: string, filters: string, codec: readonly string[] ): Promise<void> {

    if ( existsSync(output) ) return;

    await run("ffmpeg", ["-y", "-v", "error", "-i", input, "-vf", filters, ...codec, output]);

}
async function pool<T> ( items: readonly T[], width: number, work: ( item: T ) => Promise<void> ): Promise<void> {

    let next = 0;
    const worker = async (): Promise<void> => {

        while ( next < items.length ) {

            const item = items[next] as T;

            next += 1;
            await work(item);

        }

    };

    await Promise.all(Array.from({ length: width }, worker));

}
async function animatedFiles ( names: Map<string, string>, wanted: readonly string[], work: string, limit: number ): Promise<Map<string, string>> {

    const response = await fetch(animatedTree);

    if ( !response.ok ) throw new Error(`Cannot list the animated repository: ${response.status}`);

    const paths = new Set(((await response.json()) as { tree: { path: string }[] }).tree.map(( entry ) => entry.path));
    const found = new Map<string, string>();

    mkdirSync(resolve(work, "animated"), { recursive: true });

    for ( const glyph of wanted ) {

        if ( found.size >= limit ) break;

        const key = keyOf(glyph);
        const name = names.get(key);
        const candidates = name ? [`assets/${name}/animated`, `assets/${name}/Default/animated`] : [];
        const folder = candidates.find(( candidate ) => [...paths].some(( path ) => path.startsWith(`${candidate}/`) && path.endsWith(".png")));
        const path = folder ? [...paths].find(( entry ) => entry.startsWith(`${folder}/`) && entry.endsWith(".png")) : undefined;

        if ( path ) found.set(key, path);

    }

    await pool([...found], 4, async ( [key, path] ) => {

        await fetchBinary(resolve(work, "animated", `${key}.png`), `${animatedMedia}/${path.split("/").map(encodeURIComponent).join("/")}`);

    });

    return found;

}
export async function generateEmoji ( sources: EmojiSources ): Promise<{ tuples: number; statics: number; animated: number }> {

    mkdirSync(sources.work, { recursive: true });

    if ( !existsSync(resolve(sources.fluent, "assets")) ) throw new Error(`Clone microsoft/fluentui-emoji (assets/*/metadata.json, assets/*/3D, assets/*/*/3D) into ${sources.fluent}`);

    const rows = parseEmojiTest(await fetchText(sources.work, "emoji-test.txt"));
    const en: Annotations = parseAnnotations(await fetchText(sources.work, "en-derived.xml"), parseAnnotations(await fetchText(sources.work, "en.xml")));
    const ar: Annotations = parseAnnotations(await fetchText(sources.work, "ar-derived.xml"), parseAnnotations(await fetchText(sources.work, "ar.xml")));
    const { statics, names } = fluentIndex(sources.fluent);
    const animated = await animatedFiles(names, sources.favorites, sources.work, sources.limit);
    const catalog = buildCatalog(rows, en, ar, { statics: new Set(statics.keys()), animated: new Set(animated.keys()) });
    const stillFolder = resolve(sources.assets, "static");
    const movingFolder = resolve(sources.assets, "animated");
    const wanted: [string, string][] = [];

    mkdirSync(stillFolder, { recursive: true });
    mkdirSync(movingFolder, { recursive: true });

    for ( const tuple of catalog.tuples ) {

        for ( const glyph of [tuple[0], ...tonedGlyphs(tuple as Tuple)] ) {

            const file = statics.get(keyOf(glyph));

            if ( file ) wanted.push([keyOf(glyph), file]);

        }

    }

    await pool(wanted, 4, ( [key, file] ) => convert(file, resolve(stillFolder, `${key}.webp`), `scale=${sources.size}:${sources.size}:flags=lanczos`, ["-frames:v", "1", "-c:v", "libwebp", "-q:v", "80"]));
    await pool([...animated.keys()], 2, ( key ) => convert(resolve(sources.work, "animated", `${key}.png`), resolve(movingFolder, `${key}.webp`), `fps=${sources.fps},scale=${Math.round(sources.size * 1.5)}:${Math.round(sources.size * 1.5)}:flags=lanczos`, ["-c:v", "libwebp_anim", "-lossless", "0", "-q:v", "70", "-loop", "0", "-an"]));
    writeFileSync(sources.catalog, catalogModule(catalog));
    writeFileSync(resolve(sources.assets, "LICENSE.txt"), license);

    return { tuples: catalog.tuples.length, statics: wanted.length, animated: animated.size };

}
export function defaultSources ( assets: string, catalog: string ): EmojiSources {

    const work = resolve(tmpdir(), "engine-emoji");

    return { work, fluent: resolve(work, "fluent"), assets, catalog, size: 64, fps: 15, favorites, limit: 100 };

}
if ( import.meta.main ) {

    const here = resolve(import.meta.dir, "../../..");
    const result = await generateEmoji(defaultSources(resolve(here, "assets/emoji"), resolve(here, "packages/emoji/src/catalog.ts")));

    console.log(`Emoji: ${result.tuples} entries, ${result.statics} static, ${result.animated} animated; ${statSync(resolve(here, "packages/emoji/src/catalog.ts")).size} bytes of catalog.`);

}
