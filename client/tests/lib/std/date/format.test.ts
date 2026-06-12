import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatRelative } from "@/lib/std/date";

const NOW = new Date("2026-06-12T12:00:00Z");

const at = ( offsetMs: number ) => new Date(NOW.getTime() + offsetMs).toISOString();

beforeEach(() => {

    vi.useFakeTimers();
    vi.setSystemTime(NOW);

});
afterEach(() => {

    vi.useRealTimers();

});
describe("formatRelative", () => {

    it("formats past offsets with the largest fitting unit", () => {

        expect(formatRelative(at(-30_000))).toBe("30 seconds ago");
        expect(formatRelative(at(-300_000))).toBe("5 minutes ago");
        expect(formatRelative(at(-10_800_000))).toBe("3 hours ago");
        expect(formatRelative(at(-604_800_000))).toBe("last week");

    });
    it("formats future offsets", () => {

        expect(formatRelative(at(86_400_000))).toBe("tomorrow");
        expect(formatRelative(at(7_200_000))).toBe("in 2 hours");

    });
    it("collapses sub-second deltas to now", () => {

        expect(formatRelative(at(0))).toBe("now");
        expect(formatRelative(at(500))).toBe("now");

    });
    it("speaks the requested locale", () => {

        expect(formatRelative(at(86_400_000), "ar")).toBe("غدًا");
        expect(formatRelative(at(0), "ar")).toBe("الآن");
        expect(formatRelative(at(-10_800_000), "ar")).toContain("ساعات");

    });
    it("returns an empty string for invalid input", () => {

        expect(formatRelative("not-a-date")).toBe("");

    });

});
