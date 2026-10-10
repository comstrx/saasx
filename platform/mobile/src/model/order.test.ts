import { cancelOutcomeOf, pooled, type QuoteFace, upcomingOf } from "@/model/order";

describe("a cancel says what money comes back", () => {

    test("an unpaid order has nothing to return", () => {

        expect(cancelOutcomeOf({ paid: false, canRefund: true, refundable: { amount: 10, currency: "USD" } })).toBe("unpaid");

    });

    test("a paid refundable order returns its refundable amount", () => {

        expect(cancelOutcomeOf({ paid: true, canRefund: true, refundable: { amount: 24.22, currency: "USD" } })).toBe("refund");

    });

    test("a paid order that refuses refunds, or owes nothing back, keeps the money", () => {

        expect(cancelOutcomeOf({ paid: true, canRefund: false, refundable: { amount: 24.22, currency: "USD" } })).toBe("kept");
        expect(cancelOutcomeOf({ paid: true, canRefund: true, refundable: { amount: 0, currency: "USD" } })).toBe("kept");
        expect(cancelOutcomeOf({ paid: true, canRefund: true, refundable: null })).toBe("kept");

    });

});

describe("a basket's quotes pool into one receipt", () => {

    const face = ( currency: string, total: number, lines: QuoteFace["lines"] ): QuoteFace =>
        ({ currency, total, deposit: 0, lines, extras: [], options: [], premiums: [] });

    test("lines of one key and tone add up, and the totals sum", () => {

        const pool = pooled([
            face("EGP", 1564.61, [
                { key: "base", tone: "charge", amount: { amount: 1697.5, currency: "EGP" } },
                { key: "level", tone: "discount", amount: { amount: 72.29, currency: "EGP" } },
            ]),
            face("EGP", 3524.5, [
                { key: "base", tone: "charge", amount: { amount: 4365, currency: "EGP" } },
                { key: "level", tone: "discount", amount: { amount: 185.75, currency: "EGP" } },
            ]),
        ]);

        expect(pool?.total).toEqual({ amount: 1564.61 + 3524.5, currency: "EGP" });
        expect(pool?.lines).toEqual([
            { key: "base", tone: "charge", amount: { amount: 1697.5 + 4365, currency: "EGP" } },
            { key: "level", tone: "discount", amount: { amount: 72.29 + 185.75, currency: "EGP" } },
        ]);

    });

    test("a missing quote or a mixed currency pools nothing", () => {

        expect(pooled([])).toBeNull();
        expect(pooled([ face("EGP", 10, []), null ])).toBeNull();
        expect(pooled([ face("EGP", 10, []), face("USD", 10, []) ])).toBeNull();

    });

});

describe("the upcoming trip is the nearest live booking still ahead", () => {

    const trip = ( state: string, startsAt: string | null, scheduledAt: string | null = null ) => ({ state, startsAt, scheduledAt });

    test("it picks the nearest dated booking from today on", () => {

        const picked = upcomingOf([ trip("confirmed", "2026-11-02"), trip("confirmed", "2026-10-20 09:00:00"), trip("confirmed", "2026-10-01") ], "2026-10-04");

        expect(picked?.startsAt).toBe("2026-10-20 09:00:00");

    });

    test("cancelled, completed and undated bookings never lead", () => {

        expect(upcomingOf([ trip("cancelled", "2026-10-10"), trip("completed", "2026-10-11"), trip("confirmed", null) ], "2026-10-04")).toBeNull();

    });

    test("a scheduled session counts when it has no start", () => {

        expect(upcomingOf([ trip("pending", null, "2026-10-06T10:00:00Z") ], "2026-10-04")?.scheduledAt).toBe("2026-10-06T10:00:00Z");

    });

});
