import { helloWorld } from "base";
import { test } from "vitest";

test("helloWorld", ({ bench }) => {
    bench("helloWorld", () => {
        helloWorld();
    });
});
