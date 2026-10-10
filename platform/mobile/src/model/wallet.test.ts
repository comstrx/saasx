import { cancelFee, presetsOf, signed, type Transaction } from "@/model/wallet";

const withdraw = ( patch: Partial<Transaction> = {} ): Transaction => ({
    id: 1,
    reference: "W-1",
    kind: "withdraw",
    state: "pending",
    gateway: "zain_cash",
    amount: 100,
    currency: "USD",
    note: "",
    at: null,
    canCancel: true,
    penaltyRate: 2,
    penaltyFixed: 0,
    freeBefore: null,
    ...patch,
});

describe("a cancel keeps what the server would keep", () => {

    const now = Date.parse("2026-09-11T12:00:00Z");

    test("no free window means nothing is kept, whatever the published rate", () => {

        expect(cancelFee(withdraw(), now)).toBe(0);

    });

    test("inside the free window nothing is kept", () => {

        expect(cancelFee(withdraw({ freeBefore: "2026-09-11 13:00:00" }), now)).toBe(0);

    });

    test("past the window the fixed part and the rate are kept, never more than the amount", () => {

        expect(cancelFee(withdraw({ freeBefore: "2026-09-11 11:00:00", penaltyFixed: 1 }), now)).toBe(3);
        expect(cancelFee(withdraw({ freeBefore: "2026-09-11 11:00:00", penaltyFixed: 150 }), now)).toBe(100);

    });

    test("a row that cannot be cancelled keeps nothing", () => {

        expect(cancelFee(withdraw({ canCancel: false, freeBefore: "2026-09-11 11:00:00" }), now)).toBe(0);

    });

});

describe("quick amounts come from the ceiling the server allows", () => {

    test("a ceiling spreads four round amounts inside it", () => {

        expect(presetsOf(10000)).toEqual([ 50, 100, 200, 500 ]);
        expect(presetsOf(18606.56)).toEqual([ 100, 200, 500, 1000 ]);
        expect(presetsOf(100, 10)).toEqual([ 10, 20, 50, 100 ]);

    });

    test("a floor is respected and nothing passes the ceiling", () => {

        expect(presetsOf(7500, 60)).toEqual([ 100, 200, 500, 1000 ]);
        expect(presetsOf(30).every(( value ) => value <= 30 )).toBe(true);

    });

    test("no ceiling means no quick amounts", () => {

        expect(presetsOf(0)).toEqual([]);

    });

});

describe("a movement's sign rides its amount", () => {

    test("a credit reads +, a debit reads a true minus, both isolated from the line around them", () => {

        expect(signed("EGP 1,564.61", true)).toBe("⁦+EGP 1,564.61⁩");
        expect(signed("1,564.61 ج.م", false)).toBe("⁦−1,564.61 ج.م⁩");

    });

});
