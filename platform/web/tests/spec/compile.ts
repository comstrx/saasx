import assert from "node:assert/strict";
import { resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { createApi } from "../../src/api/core/client.ts";
import { packContract, unpackContract } from "../../src/api/core/pack.ts";
import { requestContext } from "../../src/api/core/request.ts";
import { validateSpec } from "../../src/lib/spec/validate.ts";
import { assetFiles, composeAssets } from "../../tools/assets/index.ts";
import { assemble } from "../../tools/compile/index.ts";
import { root } from "../../tools/core/index.ts";
import { composeMessages } from "../../tools/messages/index.ts";
import { loadSpec } from "../../tools/specs/index.ts";
import { same } from "../core/assert.ts";
import { coreApi, invoke, recorder, values } from "../core/backend.ts";
import { dictionaries, minimal, project } from "../core/project.ts";

const core = composeMessages();
const golden = fileURLToPath(new URL("./theme.css", import.meta.url));
const publicRoot = resolve(root, "public");
const fixture = {
    ...minimal,
    contents: { infos: { name: "Fixture" }, logos: { logo: "/assets/images/brand/logo.png" } },
    settings: { fonts: { en: "latin.ttf" }, mediaOrigins: ["https://cdn.example.test"] },
    themes: { colors: { light: { primary: "#123456" } } },
    features: { products: { operations: { list: { request: { fields: { query: "q" } } } } } },
};
const brand = {
    "images/logo.png": Buffer.from("fixture-logo"),
    "fonts/latin.ttf": Buffer.from("fixture-font"),
    "well-known/security.txt": "Contact: mailto:security@example.test\nExpires: 2999-01-01T00:00:00.000Z\n",
    "messages/en.json": '{"greeting":"Hello"}',
    "messages/ar.json": '{"greeting":"مرحباً"}',
};

test("the packed contract round-trips and the whole core API shares one header set", () => {

    const { contract } = coreApi();
    const packed = packContract(contract);

    same(unpackContract(JSON.parse(JSON.stringify(packed))), contract, "unpacked contract");
    assert.equal(new Set(packed.tables.request.map(( entry ) => JSON.stringify(entry.headers))).size, 1);
    assert.ok(JSON.stringify(packed).length * 3 < JSON.stringify(contract).length);

});
test("the core default theme stylesheet matches the golden", async ( t ) => {

    const { config, schema } = validateSpec(minimal, { screens: [] }, dictionaries);
    const spec = { config, schema, messages: dictionaries, identity: "core:default", folder: publicRoot };

    t.assert.fileSnapshot(assemble(spec, assetFiles(publicRoot, true), "production").css, golden, {
        serializers: [( value ) => String(value)],
    });

});
test("a spec project on disk overrides the core key by key and reaches the wire", async () => {

    const { directory, identity, dispose } = project(fixture, brand);

    try {

        const spec = await loadSpec(identity, directory);
        const assets = composeAssets(publicRoot, resolve(spec.folder, "brand"));
        const built = assemble(spec, assets, "production");
        const contract = unpackContract(built.data.config.contract);
        const { calls, transport } = recorder(built.data.config.api.connections);
        const client = createApi(built.data.config.api, contract, requestContext(built.data.config.api.context, values), { execution: "client", transport });

        assert.equal(spec.config.content.name, "Fixture");
        assert.equal(spec.config.content.tagline, "");
        assert.deepEqual(spec.messages, { en: { ...core.en, greeting: "Hello" }, ar: { ...core.ar, greeting: "مرحباً" } });
        same(assets.get("assets/images/brand/logo.png"), brand["images/logo.png"], "brand logo bytes");
        same(assets.get("assets/fonts/latin.ttf"), brand["fonts/latin.ttf"], "brand font bytes");
        assert.deepEqual(assets.get(".well-known/security.txt")?.toString(), brand["well-known/security.txt"]);
        assert.ok(assets.has("assets/fonts/arabic-regular.ttf"));
        assert.ok(assets.has("assets/licenses/manrope-ofl.txt"));
        assert.match(built.css, /--primary: #123456;/);
        assert.match(built.css, /font-family: "Site-en"; src: url\("\/assets\/fonts\/latin\.ttf"\); font-weight: 100 900;/);
        assert.match(built.css, /font-family: "Site-ar"/);
        assert.deepEqual(built.data.connections.images, ["https://api.example.test", "https://cdn.example.test"]);
        assert.ok(built.data.connections.origins.includes("https://api.example.test"));
        assert.deepEqual(built.data.routing, { locales: ["en", "ar"], defaultLocale: "en" });
        assert.match(built.assetRoot, /^\/_generated\/production\/[a-f0-9]{20}$/);
        assert.equal(contract.features.products?.list?.enabled && contract.features.products.list.request.fields.query, "q");

        await invoke(client, "products", "list", { query: "riyadh" }).catch(() => undefined);

        assert.equal(calls[0]?.path, "/catalogs?q=riyadh");

    }
    finally {

        dispose();

    }

});
test("the browser may reach the API, its socket on any port and the media origins, per mode", () => {

    const urls = { production: "https://api.example.test", local: "http://localhost:8000" };
    const settings = { mediaOrigins: ["https://cdn.example.test"], frameOrigins: ["https://www.openstreetmap.org"] };
    const contracts = { ...minimal.contracts, urls };
    const { config, schema } = validateSpec({ ...minimal, settings, contracts }, { screens: [] }, dictionaries);
    const spec = { config, schema, messages: dictionaries, identity: "r", folder: publicRoot };
    const assets = assetFiles(publicRoot, true);
    const production = assemble(spec, assets, "production").data.connections;
    const development = assemble(spec, assets, "development").data.connections;

    assert.deepEqual(production, {
        images: ["https://api.example.test", "https://cdn.example.test"],
        frames: ["https://www.openstreetmap.org"],
        origins: ["https://api.example.test", "wss://api.example.test:*"],
    });
    assert.deepEqual(development, {
        images: ["http://localhost:8000", "https://cdn.example.test"],
        frames: ["https://www.openstreetmap.org"],
        origins: ["http://localhost:8000", "ws://localhost:*"],
    });

});
test("the compiler is deterministic: one spec, one output, byte for byte", () => {

    const { config, schema } = validateSpec(minimal, { screens: [] }, dictionaries);
    const spec = { config, schema, messages: dictionaries, identity: "r", folder: publicRoot };
    const assets = assetFiles(publicRoot, true);
    const first = assemble(spec, assets, "production");
    const second = assemble(spec, assets, "production");

    assert.equal(JSON.stringify(first.data), JSON.stringify(second.data));
    assert.equal(first.css, second.css);
    assert.equal(first.assetRoot, second.assetRoot);

});
test("a dangling brand reference stops the compiler", async () => {

    const { directory, identity, dispose } = project({ ...minimal, contents: { logos: { logo: "/assets/images/brand/missing.png" } } }, brand);

    try {

        const spec = await loadSpec(identity, directory);

        assert.throws(() => assemble(spec, composeAssets(publicRoot, resolve(spec.folder, "brand")), "production"), /Missing selected brand asset/);

    }
    finally {

        dispose();

    }

});
