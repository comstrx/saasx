import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { type EmojiMotion, type EmojiTuple, emojiKey } from "@engine/world";
import { type Annotations, buildCatalog, catalogModule, flagCode, parseAnnotations, parseEmojiTest, tonedGlyphs } from "./emoji.ts";

export type EmojiSources = { work: string; fluent: string; flags: string; assets: string; catalog: string; size: number; cell: number; favorites: readonly string[]; limit: number };
export type FluentIndex = Map<string, string>;

const run = promisify(execFile);
const pins = {
    unicode: "18.0",
    cldr: "b5a68e61ac365706856ea8796585783579c9a3ff",
    fluent: "1ffb34c752ecf5d402f04cfb4b392c77f57c54bc",
    animated: "daa0365c09795789ed2bc6e8b228c97736cb6669",
} as const;
const cldr = `https://raw.githubusercontent.com/unicode-org/cldr/${pins.cldr}/common`;
const texts: Readonly<Record<string, string>> = {
    "emoji-test.txt": `https://unicode.org/Public/${pins.unicode}.0/emoji/emoji-test.txt`,
    "en.xml": `${cldr}/annotations/en.xml`,
    "en-derived.xml": `${cldr}/annotationsDerived/en.xml`,
    "ar.xml": `${cldr}/annotations/ar.xml`,
    "ar-derived.xml": `${cldr}/annotationsDerived/ar.xml`,
};
const animatedTree = `https://api.github.com/repos/microsoft/fluentui-emoji-animated/git/trees/${pins.animated}?recursive=1`;
const animatedMedia = `https://media.githubusercontent.com/media/microsoft/fluentui-emoji-animated/${pins.animated}`;
const columns = 8;
const maxFrames = 48;
const toneFolders = ["Light", "Medium-Light", "Medium", "Medium-Dark", "Dark"];
const favorites = [..."😂❤️🤣👍😭🙏😘🥰😍😊🎉😁💕🥺😅🔥☺️🤦♥️🤷🙄😆🤗😉🎂🤔👏🙂😳🥳😎👌💜😔💪✨💖👀😋😏😢👉💗😩💯🌹💞🎈💙😃😡💐😜🙈🤞😄🤤🙌🤪❣️😀💋💀👇💔😌💓🤩🙃😬😱😴🤭😐🌞😒😇🌸😈🎶✌️🎊🥵😞💚☀️🖤💰😚👑🎁💥🙋☹️😑🥴👈💩✅👋🤝🥲😤🤯🎯🚀⭐🌟💎🏆🍕☕🥹🫶🫠😮😲🤓🥶🤮🤢😷🤒🤕🤠🥸😺🙀🐶🐱🦁🐸🦄🐢🌈🌙⚡❄️🍎🍔🍺🍷🎮⚽🏀🎸🎤📱💡🔔🔒🔑✈️🚗🏠🎄🎃👻🤖👽🎵🥇🏅"].reduce<string[]>(( list, character ) => {

    if ( character === "\uFE0F" ) list[list.length - 1] += character;
    else list.push(character);

    return list;

}, []);
const license = `Emoji artwork: Microsoft Fluent Emoji (https://github.com/microsoft/fluentui-emoji, https://github.com/microsoft/fluentui-emoji-animated), MIT License, Copyright (c) Microsoft Corporation. The 3D renders were resized and encoded as WebP; the animated set as sprite sheets of up to 48 frames in 8 columns, encoded as WebP.
Flag emoji: rendered from the flag images in assets/flag (see assets/flag/LICENSE.txt), resized onto a square transparent canvas.
Emoji names and keywords in packages/world/src/generated/emoji.ts: Unicode Emoji 18.0 data files and CLDR annotations, Unicode License v3 (https://www.unicode.org/license.txt), Copyright Unicode, Inc.
`;

async function fetchText ( work: string, name: string ): Promise<string> {

    const file = resolve(work, `${pins.cldr.slice(0, 8)}-${pins.unicode}-${name}`);

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

        const key = emojiKey(glyph);
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
async function probe ( file: string ): Promise<{ frames: number; rate: number }> {

    const { stdout } = await run("ffprobe", ["-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames,r_frame_rate", "-of", "csv=p=0", file]);
    const [rate = "0", frames = "0"] = stdout.trim().split(",");
    const [top = "0", bottom = "1"] = rate.split("/");

    return { frames: Number(frames), rate: Number(top) / Number(bottom) };

}
async function sheet ( input: string, output: string, cell: number ): Promise<EmojiMotion> {

    const source = await probe(input);
    const frames = Math.max(columns, Math.floor(Math.min(source.frames, maxFrames) / columns) * columns);
    const ms = Math.round((1000 * source.frames) / source.rate);

    if ( !source.frames || !source.rate ) throw new Error(`Cannot read the frames of ${input}`);

    await convert(input, output, `fps=${(frames * source.rate) / source.frames},scale=${cell}:${cell}:flags=lanczos,tile=${columns}x${frames / columns}`, ["-frames:v", "1", "-c:v", "libwebp", "-q:v", "75"]);

    return [frames, ms];

}
async function pinned ( fluent: string ): Promise<void> {

    const { stdout } = await run("git", ["-C", fluent, "rev-parse", "HEAD"]);

    if ( stdout.trim() !== pins.fluent ) throw new Error(`The Fluent checkout in ${fluent} is at ${stdout.trim()}, the catalog is pinned to ${pins.fluent}.`);

}
export async function generateEmoji ( sources: EmojiSources ): Promise<{ tuples: number; statics: number; motions: number }> {

    mkdirSync(sources.work, { recursive: true });

    if ( !existsSync(resolve(sources.fluent, "assets")) ) throw new Error(`Clone microsoft/fluentui-emoji at ${pins.fluent} (sparse: assets/*/metadata.json, assets/*/3D, assets/*/*/3D) into ${sources.fluent}`);

    await pinned(sources.fluent);

    const rows = parseEmojiTest(await fetchText(sources.work, "emoji-test.txt"));
    const en: Annotations = parseAnnotations(await fetchText(sources.work, "en-derived.xml"), parseAnnotations(await fetchText(sources.work, "en.xml")));
    const ar: Annotations = parseAnnotations(await fetchText(sources.work, "ar-derived.xml"), parseAnnotations(await fetchText(sources.work, "ar.xml")));
    const { statics, names } = fluentIndex(sources.fluent);

    for ( const row of rows ) {

        const code = flagCode(row.glyph);
        const file = code ? resolve(sources.flags, `${code}.webp`) : undefined;

        if ( file && existsSync(file) ) statics.set(emojiKey(row.glyph), file);

    }

    const animated = await animatedFiles(names, sources.favorites, sources.work, sources.limit);
    const stillFolder = resolve(sources.assets, "static");
    const motionFolder = resolve(sources.assets, "motion");
    const motions = new Map<string, EmojiMotion>();

    mkdirSync(stillFolder, { recursive: true });
    mkdirSync(motionFolder, { recursive: true });

    await pool([...animated.keys()], 2, async ( key ) => {

        motions.set(key, await sheet(resolve(sources.work, "animated", `${key}.png`), resolve(motionFolder, `${key}.webp`), sources.cell));

    });

    const catalog = buildCatalog(rows, en, ar, { statics: new Set(statics.keys()), motions });
    const wanted: [string, string][] = [];

    for ( const tuple of catalog.tuples ) {

        for ( const glyph of [tuple[0], ...tonedGlyphs(tuple as EmojiTuple)] ) {

            const file = statics.get(emojiKey(glyph));

            if ( file ) wanted.push([emojiKey(glyph), file]);

        }

    }

    await pool(wanted, 4, ( [key, file] ) => convert(file, resolve(stillFolder, `${key}.webp`), `scale=${sources.size}:${sources.size}:force_original_aspect_ratio=decrease:flags=lanczos,format=rgba,pad=${sources.size}:${sources.size}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`, ["-frames:v", "1", "-c:v", "libwebp", "-q:v", "80"]));
    writeFileSync(sources.catalog, catalogModule(catalog));
    writeFileSync(resolve(sources.assets, "LICENSE.txt"), license);

    return { tuples: catalog.tuples.length, statics: wanted.length, motions: motions.size };

}
export function defaultSources ( assets: string, catalog: string ): EmojiSources {

    const work = resolve(tmpdir(), "engine-emoji");

    return { work, fluent: resolve(work, "fluent"), flags: resolve(assets, "../flag"), assets, catalog, size: 64, cell: 128, favorites, limit: 100 };

}
if ( import.meta.main ) {

    const here = resolve(import.meta.dir, "../../..");
    const result = await generateEmoji(defaultSources(resolve(here, "assets/emoji"), resolve(here, "packages/world/src/generated/emoji.ts")));

    console.log(`Emoji: ${result.tuples} entries, ${result.statics} static, ${result.motions} in motion; ${statSync(resolve(here, "packages/world/src/generated/emoji.ts")).size} bytes of catalog.`);

}
