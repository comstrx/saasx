import { describe, expect, it } from "vitest";
import { has, hasAll, hasAny } from "./has";
import { toSet } from "./permission";

const set = toSet(["users.view", "users.create", "orders.view"]);
const empty = toSet([]);

describe("has", () => {

    it("checks a single permission", () => {

        expect(has(set, "users.view")).toBe(true);
        expect(has(set, "users.delete")).toBe(false);

    });

    it("denies everything on an empty set", () => {

        expect(has(empty, "users.view")).toBe(false);

    });

});

describe("hasAll", () => {

    it("requires every permission", () => {

        expect(hasAll(set, ["users.view", "users.create"])).toBe(true);
        expect(hasAll(set, ["users.view", "users.delete"])).toBe(false);

    });

    it("is vacuously true on an empty requirement list", () => {

        expect(hasAll(set, [])).toBe(true);
        expect(hasAll(empty, [])).toBe(true);

    });

    it("denies any requirement on an empty set", () => {

        expect(hasAll(empty, ["users.view"])).toBe(false);

    });

});

describe("hasAny", () => {

    it("passes on at least one match", () => {

        expect(hasAny(set, ["users.delete", "orders.view"])).toBe(true);
        expect(hasAny(set, ["users.delete", "orders.update"])).toBe(false);

    });

    it("is false on an empty requirement list or empty set", () => {

        expect(hasAny(set, [])).toBe(false);
        expect(hasAny(empty, ["users.view"])).toBe(false);

    });

});
