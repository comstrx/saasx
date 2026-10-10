import assert from "node:assert/strict";
import { test } from "node:test";
import { optionsOf } from "../../tools/features/index.ts";

test("a feature entry's options are read as literals, as const and nested, and anything computed is refused by path", () => {

    const options = { limit: 4, open: true, label: null, tags: ["a", "b"], card: { radius: "md", depth: -1 } };
    const read = ( code: string ) => optionsOf(code, "features/cart");
    const computed = /^Error: features\/cart\.options\.run: feature options are literal values only/;

    assert.deepEqual(read(`export const options = ${JSON.stringify(options)} as const;\nexport default () => null;`), options);
    assert.equal(read("export default () => null;"), undefined);
    assert.throws(() => read("export const options = { run: Date.now() };"), computed);
    assert.throws(() => read("export const options = { card: { size: limit } };"), /features\/cart\.options\.card\.size/);
    assert.throws(() => read("export const options = { [key]: 1 };"), /features\/cart\.options:/);
    assert.throws(() => read("export const options = [1];"), /features\/cart\.options:/);

});
