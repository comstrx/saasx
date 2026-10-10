import assert from "node:assert/strict";
import { test } from "node:test";
import { resourceDefaults } from "../../src/api/core/resource.ts";
import { composeSettings } from "../../src/lib/site/settings.ts";
import { limitsOf, uploadLimits } from "../../src/lib/std/form.ts";

const local = {
    ...resourceDefaults("settings"),
    languages: ["en", "ar"],
    currency: "USD",
    currencies: ["USD", "SAR"],
    theme: "light" as const
};

test("with the backend down, the static settings are the site settings", () => {

    const settings = composeSettings({ remote: local, local });

    assert.deepEqual(settings.locale, { default: "en", enabled: ["en", "ar"], timeZone: "UTC" });
    assert.deepEqual(settings.currency, { default: "USD", enabled: ["USD", "SAR"] });
    assert.deepEqual(settings.theme, { default: "light", enabled: ["light", "dark", "system"] });

});
test("server preferences replace the static ones only where the core can honour them", () => {

    const remote = {
        ...local,
        language: "fr",
        languages: ["fr", "ar"],
        time_zone: "Asia/Riyadh",
        currency: "EGP",
        currencies: ["EGP", "SAR"],
        theme: "system" as const,
        themes: ["dark" as const],
    };
    const settings = composeSettings({ remote, local, locales: ["ar", "xx"], currencies: ["SAR", "EGP", "EGP"] });

    assert.deepEqual(settings.locale, { default: "en", enabled: ["en", "ar"], timeZone: "Asia/Riyadh" });
    assert.deepEqual(settings.currency, { default: "EGP", enabled: ["SAR", "EGP"] });
    assert.deepEqual(settings.theme, { default: "dark", enabled: ["dark"] });

});
test("junk from the server never empties a choice", () => {

    const remote = { ...local, languages: ["xx"], currencies: [], themes: ["light" as const] };
    const settings = composeSettings({ remote, local, locales: [], currencies: [] });

    assert.deepEqual(settings.locale.enabled, ["en", "ar"]);
    assert.deepEqual(settings.currency, { default: "USD", enabled: ["USD", "SAR"] });
    assert.equal(settings.theme.default, "light");

});
test("with the backend down, uploads keep the same ceiling as the transport default", () => {

    const policy = resourceDefaults("policy");

    assert.deepEqual(limitsOf(policy.upload_max_bytes, policy.request_max_bytes, policy.upload_max_count), uploadLimits);

});
