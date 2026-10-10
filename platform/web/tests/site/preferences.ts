import assert from "node:assert/strict";
import { before, test } from "node:test";
import { backend, runtime, visit } from "../core/site.ts";

type Actions = typeof import("../../src/api/workflow/actions.ts");
type Cookies = typeof import("../../src/lib/spec/config.ts")["preferences"]["cookies"];

let actions: Actions;
let cookies: Cookies;

before(async () => {

    await runtime();
    backend({});
    actions = await import("../../src/api/workflow/actions.ts");
    cookies = (await import("../../src/lib/spec/config.ts")).preferences.cookies;

});
test("accepted preferences become cookies, in the site's own choices only", async () => {

    visit();

    const store = await (await import("next/headers")).cookies();
    const held = ( name: string ) => store.get(name)?.value;

    await actions.savePreferences({ language: "ar", currency: "SAR", country: "EG", location: { latitude: 30.04, longitude: 31.23 } });

    assert.deepEqual(Object.values(cookies).map(held), ["ar", "SAR", "EG", "30.04000,31.23000"]);

    await actions.savePreferences({ location: null });

    assert.equal(held(cookies.location), "denied");

    await assert.rejects(actions.savePreferences({ currency: "JPY" }), /Unsupported preference/);
    await assert.rejects(actions.savePreferences({ language: "fr" }), /Unsupported preference/);
    await assert.rejects(actions.savePreferences({ country: "eg" }), /Unsupported preference/);
    await assert.rejects(actions.savePreferences({ location: { latitude: 91, longitude: 0 } }), /Unsupported preference/);

});
