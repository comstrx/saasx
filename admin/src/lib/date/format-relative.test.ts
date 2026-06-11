import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatRelative } from "./format-relative";

const now = new Date("2026-06-11T12:00:00Z");

const at = ( offsetMs: number ) => new Date(now.getTime() + offsetMs).toISOString();

beforeEach(() => {

    vi.useFakeTimers();
    vi.setSystemTime(now);

});

afterEach(() => {

    vi.useRealTimers();

});

describe("formatRelative", () => {

    it("formats past minutes in english", () => {

        expect(formatRelative(at(-5 * 60_000), "en")).toBe("5 minutes ago");

    });

    it("formats future hours in english", () => {

        expect(formatRelative(at(2 * 3_600_000), "en")).toBe("in 2 hours");

    });

    it("picks the largest fitting unit at boundaries", () => {

        expect(formatRelative(at(-59_000), "en")).toBe("59 seconds ago");
        expect(formatRelative(at(-60_000), "en")).toBe("1 minute ago");
        expect(formatRelative(at(-86_400_000), "en")).toBe("yesterday");

    });

    it("formats a zero delta as now", () => {

        expect(formatRelative(at(0), "en")).toBe("now");

    });

    it("formats arabic in both directions", () => {

        const past = formatRelative(at(-5 * 60_000), "ar");
        const future = formatRelative(at(3 * 86_400_000), "ar");

        expect(past).toContain("قبل");
        expect(past).toContain("دقائق");
        expect(future).toContain("خلال");
        expect(future).toContain("أيام");

    });

});
