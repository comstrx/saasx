import assert from "node:assert/strict";
import { isDeepStrictEqual } from "node:util";

export function same ( actual: unknown, expected: unknown, label: string ): void {

    assert.ok(isDeepStrictEqual(actual, expected), `${label}: actual and expected differ.`);

}
