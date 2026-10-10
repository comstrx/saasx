import assert from "node:assert/strict";
import { test } from "node:test";
import { resourceDefaults } from "../../src/api/core/resource.ts";
import { backend, failure, harness, invoke } from "../core/backend.ts";

const offline = { ...backend, connections: { primary: { baseUrl: null }, broadcast: { baseUrl: null } } };

test("collections project unknown keys away and expose pagination and supports", async () => {

    const { client, state } = harness("client");

    state.reply = {
        status: 200,
        body: {
            status: true,
            data: [{ id: 1, name: "A", type: "hotel", junk: true }],
            meta: {
                page: 1,
                limit: 10,
                total: 30,
                paged: true,
                filters: [],
                supports: { filters: ["type"], sorts: ["newest"], sortable: { newest: "created_at", recommended: null }, groups: null },
            },
        },
    };

    const result = await invoke(client, "products", "list", {});
    const [item] = result.resource as Record<string, unknown>[];

    assert.equal(item?.name, "A");
    assert.equal("junk" in (item ?? {}), false);
    assert.deepEqual(result.meta.pagination, { page: 1, limit: 10, total: 30, pages: null, paged: true });
    assert.deepEqual(result.meta.supports, {
        filters: ["type"],
        sorts: ["newest"],
        sortable: { newest: "created_at", recommended: null },
        facets: [],
        stats: [],
        metrics: [],
        groups: [],
        series: [],
    });
    assert.equal("aggregates" in result.meta, false);
    assert.equal(result.meta.source, "remote");

});
test("asked aggregates ride beside the page and the server's empty maps read as empty", async () => {

    const { client, state } = harness("client");

    state.reply = {
        status: 200,
        body: {
            status: true,
            data: [{ id: 1, name: "A", type: "hotel" }],
            meta: {
                page: 1,
                sidebar: { facets: ["type", "category"], stats: ["min_price"] },
                facets: { type: { hotel: 2, tour: 1 }, category_id: [] },
                stats: { min_price: { min: "0.00", max: "9.50", avg: "4.75", sum: "9.50" } },
                metrics: { count: 3 },
                groups: { type: [{ value: "hotel", count: 2 }] },
                series: null,
            },
        },
    };

    const result = await invoke(client, "products", "list", { facets: ["type", "category"], stats: ["min_price"] });

    assert.deepEqual(result.meta.aggregates, {
        facets: { type: { hotel: 2, tour: 1 }, category_id: {} },
        stats: { min_price: { min: "0.00", max: "9.50", avg: "4.75", sum: "9.50" } },
        metrics: { count: 3 },
        groups: { type: [{ value: "hotel", count: 2 }] },
        series: {},
    });

});
test("throttled refusals carry the server's retry delay", async () => {

    const { client, state } = harness("client");
    const throttled = { status: false, code: "throttled", reason: "limit_exceeded", message: "limit exceeded", data: null, errors: null, meta: {} };

    state.reply = { status: 429, body: throttled, headers: { "retry-after": "30" } };

    const error = await failure(invoke(client, "orders", "list", {}));

    assert.equal(error.status, 429);
    assert.equal(error.code, "throttled");
    assert.equal(error.retryAfter, 30);

    state.reply = { status: 429, body: throttled, headers: { "retry-after": "soon" } };

    assert.equal((await failure(invoke(client, "orders", "list", {}))).retryAfter, undefined);

});
test("fresh discussions render their tallies like a read and replies nest as threads", async () => {

    const { client, state } = harness("client");

    state.reply = { status: 200, body: { status: true, data: { id: 3, content: "c", views: 0, likes: 0, dislikes: 0, deleted: false, replies: 0 }, meta: {} } };

    const comment = (await invoke(client, "articles", "comment", { articleId: 1, content: "c" })).resource as Record<string, unknown>;

    assert.deepEqual([comment.views, comment.likes, comment.dislikes, comment.replies], [0, 0, 0, 0]);

    state.reply = { status: 200, body: { status: true, data: { id: 3, content: "c", views: [], likes: [] }, meta: {} } };
    assert.equal((await failure(invoke(client, "articles", "comment", { articleId: 1, content: "c" }))).kind, "response");

    state.reply = { status: 200, body: { status: true, data: { id: 4, content: "r", replies: [{ id: 5, content: "n", replies: [] }] }, meta: {} } };

    const reply = (await invoke(client, "comments", "reply", { commentId: 3, content: "r" })).resource as { replies: { id: number; replies: unknown[] }[] };

    assert.deepEqual(reply.replies.map(( nested ) => [nested.id, nested.replies]), [[5, []]]);

});
test("a false status becomes a 422 whose errors are keyed by the semantic input names", async () => {

    const { client, state } = harness("client");

    state.reply = {
        status: 200,
        body: {
            status: false,
            code: "invalid",
            reason: "validation",
            message: "bad",
            errors: { catalog_id: ["required"], quantity: ["min"], other: ["x"] },
        },
    };

    const error = await failure(invoke(client, "orders", "preview", { productId: 1, quantity: 1 }));

    assert.equal(error.kind, "http");
    assert.equal(error.status, 422);
    assert.equal(error.code, "invalid");
    assert.equal(error.reason, "validation");
    assert.deepEqual(error.errors, { productId: ["required"], quantity: ["min"], _form: ["x"] });

});
test("confirmation details ride on throttled failures", async () => {

    const { client, state } = harness("client");

    state.reply = {
        status: 429,
        body: {
            status: false,
            code: "throttled",
            reason: "otp_pending",
            meta: { channel: "email", destination: "a***@b.co", retry_after: 30, expires_in: 300 },
        },
    };

    const error = await failure(invoke(client, "account", "sendCode", { field: "email" }));

    assert.equal(error.status, 429);
    assert.deepEqual(error.confirmation, { channel: "email", destination: "a***@b.co", retryAfter: 30, expiresIn: 300 });

});
test("acknowledgements accept empty data and documents merge over their local fallback", async () => {

    const { client, state } = harness("client");

    state.reply = { status: 200, body: { status: true, data: [], meta: {} } };

    assert.deepEqual((await invoke(client, "account", "logout", {})).resource, { success: true });

    state.reply = { status: 200, body: { status: true, data: { language: "ar", currency: "SAR", id: 1 }, meta: {} } };

    const settings = (await invoke(client, "settings", "read", {})).resource as Record<string, unknown>;

    assert.equal(settings.language, "ar");
    assert.equal(settings.currency, "SAR");
    assert.deepEqual(settings.languages, resourceDefaults("settings").languages);
    assert.equal("id" in settings, false);

});
test("an authored page SEO document decodes whole and an unauthored one falls back to the local seed", async () => {

    const { client, state, calls } = harness("server");
    const data = {
        id: 7, page: "about", title: "About the desk", description: "Who we are.", keywords: ["travel", "visas"], locales: ["en"],
        image: null, image_width: null, image_alt: null, canonical: "/about", indexable: true, follow: false, max_image_preview: "large",
        unavailable_after: "2027-01-01T00:00:00+00:00", twitter_card: "summary_large_image", structured_data: null, structured_type: "AboutPage",
        created_at: "2026-09-28T16:40:25+00:00", updated_at: "2026-09-29T08:00:00+00:00", related_type: null,
    };

    state.reply = { status: 200, body: { status: true, data, meta: {} } };

    const seo = (await invoke(client, "seo", "read", { path: "about" })).resource as Record<string, unknown>;

    assert.equal(calls[0]?.path, "/content/seo/about");
    assert.deepEqual([seo.title, seo.keywords, seo.locales, seo.canonical, seo.follow], ["About the desk", ["travel", "visas"], ["en"], "/about", false]);
    assert.deepEqual([seo.published_at, seo.modified_at, seo.structured_data], ["2026-09-28T16:40:25+00:00", "2026-09-29T08:00:00+00:00", true]);
    assert.equal("page" in seo, false);

    state.reply = { status: 200, body: { status: true, data: null, meta: {} } };

    assert.deepEqual((await invoke(client, "seo", "read", { path: "home" })).resource, resourceDefaults("seo"));

});
test("malformed payloads are response failures, never partial resources", async () => {

    const { client, state } = harness("client");

    state.reply = { status: 200, body: { status: true, data: "notarray", meta: {} } };
    assert.equal((await failure(invoke(client, "orders", "list", {}))).kind, "response");

    state.reply = { status: 200, body: { status: "yes", data: [], meta: {} } };
    assert.equal((await failure(invoke(client, "orders", "list", {}))).kind, "response");

});
test("without a backend, documents answer locally and everything else is a configuration failure", async () => {

    const { client, calls } = harness("client", {}, offline);
    const content = await invoke(client, "content", "read", {});

    assert.equal(content.meta.source, "local");
    assert.deepEqual(content.resource, resourceDefaults("content"));
    assert.equal((await failure(invoke(client, "products", "list", {}))).kind, "configuration");
    assert.equal(calls.length, 0);

});
test("aborted calls fail as aborted, before and during transport", async () => {

    const { client } = harness("client");
    const controller = new AbortController();

    controller.abort();

    assert.equal((await failure(invoke(client, "products", "list", {}, { signal: controller.signal }))).kind, "aborted");

});
