import { GREETING, helloWorld } from "base";
import { expect, test } from "vitest";

test("helloWorld returns the canonical greeting", () => {
    expect(helloWorld()).toBe("Hello, world!");
    expect(helloWorld()).toBe(GREETING);
});
