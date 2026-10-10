import { type Coupon, soonest, urgency, usable, welcomeGift } from "@/model/coupon";
import { dayKey } from "@/std/number";

const money = { amount: 0, currency: "EGP", display: "" };

const make = ( id: number, expiresAt: string | null, valid = true ): Coupon => ({
    id,
    code: `C${ id }`,
    name: `coupon ${ id }`,
    note: "",
    terms: "",
    kind: "percent",
    value: money,
    rate: 10,
    cap: money,
    minPrice: money,
    points: 0,
    minOrders: 0,
    valid,
    mine: false,
    startsAt: null,
    expiresAt,
});

describe("coupon", () => {

    test("picks the one about to expire, not the first in the list", () => {

        const picked = soonest([
            make(1, "2030-01-01 00:00:00"),
            make(2, "2026-10-01 00:00:00"),
            make(3, "2027-05-01 00:00:00"),
        ]);

        expect(picked?.id).toBe(2);

    });

    test("treats an open-ended coupon as the least urgent", () => {

        expect(urgency(make(1, null))).toBe(Number.MAX_SAFE_INTEGER);
        expect(soonest([ make(1, null), make(2, "2030-01-01 00:00:00") ])?.id).toBe(2);

    });

    test("returns nothing when there is nothing to give", () => {

        expect(soonest([])).toBeNull();

    });

    test("refuses an invalid or lapsed coupon", () => {

        const now = Date.parse("2026-09-10T00:00:00Z");

        expect(usable(make(1, "2030-01-01 00:00:00"), now)).toBe(true);
        expect(usable(make(2, "2026-01-01 00:00:00"), now)).toBe(false);
        expect(usable(make(3, null, false), now)).toBe(false);

    });

});

describe("dayKey", () => {

    test("stamps one bucket per calendar day on the reader's clock", () => {

        const noon = new Date(2026, 8, 10, 12, 0).getTime();
        const night = new Date(2026, 8, 10, 23, 59).getTime();

        expect(dayKey(noon)).toBe("2026-09-10");
        expect(dayKey(night)).toBe(dayKey(noon));
        expect(dayKey(new Date(2026, 8, 11, 0, 1).getTime())).not.toBe(dayKey(noon));

    });

});

describe("welcome gift", () => {

    test("does not promote owned, expired, paid or order-gated coupons", () => {

        const owned = make(1, null);
        const free = make(2, "2030-06-01T00:00:00Z");
        const points = { ...make(3, null), points: 10 };
        const orders = { ...make(4, null), minOrders: 1 };
        const expired = make(5, "2020-01-01T00:00:00Z");

        expect(welcomeGift([ owned, points, orders, expired, free ], [ owned ], Date.parse("2026-09-23T00:00:00Z"))?.id).toBe(2);

    });

    test("does not invent a gift when no eligible coupon exists", () => {

        const owned = make(1, null);

        expect(welcomeGift([ owned ], [ owned ], Date.now())).toBeNull();

    });

});
