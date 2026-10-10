import assert from "node:assert/strict";
import { test } from "node:test";
import { installedSpecs, selectSpec } from "../../tools/specs/index.ts";
import { scratch } from "../core/scratch.ts";

test("the build spec resolves to an installed folder, defaulting to the first, and names its options when wrong", () => {

    const { root, dispose } = scratch({
        "client/schema/index.ts": "",
        "tenant/config/index.ts": "",
        "draft/.keep": "",
    });

    try {

        assert.equal(selectSpec("", root), "client");
        assert.equal(selectSpec(" tenant ", root), "tenant");
        assert.deepEqual(installedSpecs(root), ["client", "tenant"]);
        assert.throws(() => selectSpec("draft", root), /Unknown or missing spec "draft".*Installed: client, tenant\./);
        assert.throws(() => selectSpec("nope", root), /Unknown or missing spec "nope"/);
        assert.throws(() => selectSpec("Bad_Name", root), /lowercase letters, numbers and hyphens/);

    }
    finally {

        dispose();

    }

});
