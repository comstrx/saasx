import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { fontDefaults } from "../../src/lib/spec/defaults.ts";
import { root, walk } from "../../tools/core/index.ts";

type Category = "images" | "videos" | "audios" | "fonts" | "licenses";

const publicRoot = resolve(root, "public");
const files = walk(publicRoot, ( _, name ) => name === "_generated");
const assets = files.filter(( file ) => file.name.startsWith("assets/"));
const fileName = /^[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.[a-z0-9]+$/;
const regions = new Intl.DisplayNames(["en"], { type: "region" });
const extensions: Record<Category, string[]> = {
    images: ["svg", "png", "webp", "jpg", "jpeg", "avif", "ico"],
    videos: ["mp4", "webm"],
    audios: ["mp3", "ogg", "m4a", "wav"],
    fonts: ["woff2", "woff", "ttf", "otf"],
    licenses: ["txt", "md"],
};
const budgets: Record<Category, number> = {
    images: 512 * 1024,
    videos: 25 * 1024 * 1024,
    audios: 5 * 1024 * 1024,
    fonts: 1024 * 1024,
    licenses: 64 * 1024,
};
const groups: Record<Category, string[]> = {
    images: ["brand", "layout", "flag", "currency"],
    videos: ["brand", "layout"],
    audios: ["brand", "layout"],
    fonts: [],
    licenses: [],
};

function category ( name: string ): Category {

    const [, folder] = name.split("/");

    assert.ok(folder && folder in extensions, `unknown asset category: ${name}`);

    return folder as Category;

}
function region ( code: string ): boolean {

    try { return regions.of(code) !== code; }
    catch { return false; }

}
test("the public tree holds only the fixed asset categories, grouped and flat", () => {

    assert.deepEqual([...new Set(files.map(( file ) => file.name.split("/")[0]))].sort(), [".well-known", "assets"]);

    for ( const { name, entry } of assets ) {

        const segments = name.split("/");
        const kind = category(name);
        const grouped = groups[kind].length > 0;

        assert.equal(entry.isFile() && !entry.isSymbolicLink(), true, `${name} must be a regular file`);
        assert.equal(segments.length, grouped ? 4 : 3, `${name} sits at the wrong depth`);

        if ( grouped ) assert.ok(groups[kind].includes(segments[2] ?? ""), `${name} is outside its groups`);

    }

});
test("every asset is named plainly, carries a known extension and stays within its budget", () => {

    for ( const { name, path, entry } of assets ) {

        const kind = category(name);

        if ( entry.name === ".gitkeep" ) continue;

        assert.match(entry.name, fileName, `${name} is not a plain lowercase name`);
        assert.ok(extensions[kind].includes(entry.name.slice(entry.name.lastIndexOf(".") + 1)), `${name} has an unexpected extension`);
        assert.ok(statSync(path).size <= budgets[kind], `${name} exceeds its ${budgets[kind]} byte budget`);

    }

});
test("placeholders only hold otherwise empty folders", () => {

    for ( const { name } of files.filter(( file ) => file.entry.name === ".gitkeep") ) {

        const folder = name.slice(0, name.lastIndexOf("/") + 1);

        assert.equal(files.filter(( file ) => file.name.startsWith(folder)).length, 1, `${folder} keeps a placeholder next to real files`);

    }

});
test("flags are real regions, one file per code", () => {

    const flags = assets.filter(( file ) => file.name.startsWith("assets/images/flag/"));

    assert.ok(flags.length > 200);

    for ( const { entry } of flags ) {

        const match = /^([a-z]{2})(?:-[a-z]{2,3})?\.svg$/.exec(entry.name);

        assert.ok(match, `${entry.name} is not a region flag`);
        assert.ok(region(match[1]?.toUpperCase() ?? ""), `${entry.name} names no region`);

    }

});
test("currency glyphs are real currencies, one file per code", () => {

    const known = new Set(Intl.supportedValuesOf("currency").map(( code ) => `${code.toLowerCase()}.svg`));
    const glyphs = assets.filter(( file ) => file.name.startsWith("assets/images/currency/"));

    for ( const { entry } of glyphs ) {

        assert.ok(known.has(entry.name), `${entry.name} is not a currency glyph`);

    }

});
test("the core font defaults are shipped by the core", () => {

    for ( const faces of Object.values(fontDefaults) ) {

        for ( const face of typeof faces === "string" ? [{ file: faces }] : faces ) {

            assert.ok(files.some(( file ) => file.name === `assets/fonts/${face.file}`), `default font ${face.file} is missing`);

        }

    }

});
test("security.txt is present, reachable and not expired", () => {

    const text = readFileSync(resolve(publicRoot, ".well-known/security.txt"), "utf8");
    const field = ( name: string ) => text.split("\n").filter(( line ) => line.startsWith(`${name}:`)).map(( line ) => line.slice(name.length + 1).trim());
    const [expires] = field("Expires");

    assert.ok(field("Contact").length >= 1);
    assert.ok(field("Contact").every(( contact ) => /^(?:mailto:|https:\/\/|tel:)/.test(contact)));
    assert.ok(expires && Date.parse(expires) > Date.now(), "security.txt has expired");

});
