import assert from "node:assert/strict";
import { test } from "node:test";
import { scan } from "../../tools/release/index.ts";
import { scratch } from "../core/scratch.ts";

test("the release scan finds a planted secret in any chunk and ignores short or absent ones", () => {

    const { root, dispose } = scratch({
        "static/chunks/app.js": 'export const a = "nothing here";',
        "static/chunks/leak.js": 'fetch("http://127.0.0.1:8000/v1", { headers: { key: "canary-front-secret-value" } });',
        "server/app/page.js": "module.exports = {};",
    });

    try {

        assert.match(scan(root, ["canary-front-secret-value"]) ?? "", /leak\.js carries cana…$/);
        assert.equal(scan(root, ["absent-secret-value", "short"]), undefined);
        assert.match(scan(root, ["http://127.0.0.1:8000"]) ?? "", /leak\.js/);

    }
    finally {

        dispose();

    }

});
