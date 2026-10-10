import { key } from "@/std/key";

describe("key.attempt", () => {

    it("mints a fresh key for every attempt in the same scope", () => {

        const first = key.attempt("login");
        const second = key.attempt("login");

        expect(first).not.toBe(second);
        expect(first.startsWith("login-")).toBe(true);

    });

});
