import { byDay, decimal, formatClock, formatDate, formatMoment, secondsUntil } from "@/std/number";

describe("rows group by the reader's calendar day", () => {

    test("two stamps on one local day share a header, whatever UTC says", () => {

        const early = { at: new Date(2026, 8, 12, 0, 30).toISOString() };
        const late = { at: new Date(2026, 8, 12, 23, 30).toISOString() };
        const next = { at: new Date(2026, 8, 13, 0, 5).toISOString() };

        expect(byDay([ next, late, early ]).map(( day ) => day.items.length )).toEqual([ 1, 2 ]);

    });

    test("a missing stamp lands in its own bucket", () => {

        expect(byDay([ { at: null } ])[0]?.key).toBe("unknown");

    });

});

describe("a date reads in the reader's language", () => {

    test("the month style drops the day, digits stay Latin", () => {

        expect(formatDate("en", "2026-09-09T09:05:00+00:00", "month")).toBe("September 2026");
        expect(formatDate("ar", "2026-09-09T09:05:00+00:00", "month")).toBe("سبتمبر 2026");

    });

    test("a missing stamp writes nothing", () => {

        expect(formatDate("en", null, "month")).toBe("");

    });

});

describe("money travels as a decimal string", () => {

    test("an amount is written with exactly its currency's digits", () => {

        expect(decimal(12.5, 2)).toBe("12.50");
        expect(decimal(20.19, 2)).toBe("20.19");
        expect(decimal(1000, 0)).toBe("1000");
        expect(decimal(0.1 + 0.2, 2)).toBe("0.30");

    });

    test("a non-number never reaches the wire", () => {

        expect(decimal(Number.NaN, 2)).toBe("0.00");

    });

});

describe("seconds until a server stamp", () => {

    const now = Date.parse("2026-09-11T15:49:01Z");

    test("the server's zone-less stamp reads as UTC and counts up to it", () => {

        expect(secondsUntil("2026-09-11 15:50:01", now)).toBe(60);
        expect(secondsUntil("2026-09-11T15:49:31Z", now)).toBe(30);

    });

    test("a past, missing or broken stamp never blocks", () => {

        expect(secondsUntil("2026-09-11 15:40:00", now)).toBe(0);
        expect(secondsUntil(null, now)).toBe(0);
        expect(secondsUntil("soon", now)).toBe(0);

    });

});

describe("a time never leaves its day period alone on a line", () => {

    test("the space before AM/PM or ص/م does not break, in either language", () => {

        for ( const locale of [ "en", "ar" ] ) {

            for ( const read of [ formatClock(locale, "2026-09-30T09:00:00"), formatMoment(locale, "2026-09-30T21:15:00") ] ) {

                expect(read).not.toMatch(/\d +\S+$/u);

            }

        }

    });

});
