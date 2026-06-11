import { describe, expect, it } from "vitest";
import { toSet } from "./permission";

describe("toSet", () => {

    it("builds a set and deduplicates", () => {

        const set = toSet(["users.view", "users.view", "orders.update"]);

        expect(set.size).toBe(2);
        expect(set.has("users.view")).toBe(true);
        expect(set.has("orders.update")).toBe(true);

    });

    it("builds an empty set from an empty list", () => {

        expect(toSet([]).size).toBe(0);

    });

});
