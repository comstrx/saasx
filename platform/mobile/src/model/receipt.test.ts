import type { Order, OrderLeg } from "@/model/order";
import { receiptPhase, troubled } from "@/model/receipt";

const leg = ( id: number, kind: string, status: string ): OrderLeg => ({
    id,
    reference: `REF-${ id }`,
    kind,
    payment: "mock",
    status,
    amount: null,
    canRefund: false,
    at: null,
});

const make = ( patch: Partial<Order> = {} ): Order => ({
    id: 1,
    catalogId: 1,
    vendorId: 0,
    reference: "ORD-1",
    state: "pending",
    stage: "",
    paid: false,
    title: "",
    image: null,
    type: "ticket",
    quantity: 1,
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
    nights: 0,
    unitPrice: null,
    tax: null,
    total: null,
    paidAmount: null,
    due: null,
    refundable: null,
    transactionId: 0,
    gateway: "",
    legs: [],
    paidAt: null,
    couponCode: "",
    canCancel: false,
    canRefund: false,
    canPay: true,
    canReview: false,
    startsAt: null,
    endsAt: null,
    scheduledAt: null,
    delivery: "",
    travellers: 0,
    cancelBefore: null,
    at: null,
    stages: [],
    moments: [],
    ...patch,
});

describe("receipt phase", () => {

    test("a declined charge reads declined, never partial", () => {

        const phase = receiptPhase(make({ legs: [ leg(1, "pay", "failed") ] }), false);

        expect(phase).toBe("declined");
        expect(troubled(phase)).toBe(true);

    });

    test("a fresh attempt after a decline is settling again", () => {

        expect(receiptPhase(make({ legs: [ leg(1, "pay", "failed"), leg(2, "pay", "pending") ] }), false)).toBe("settling");

    });

    test("a charge still pending keeps settling after the local window closes", () => {

        expect(receiptPhase(make({ legs: [ leg(1, "pay", "pending") ] }), false)).toBe("settling");

    });

    test("a failed refund is not a declined charge", () => {

        expect(receiptPhase(make({ legs: [ leg(1, "refund", "failed") ] }), false)).toBe("partial");

    });

    test("paid wins over an earlier decline", () => {

        expect(receiptPhase(make({ paid: true, legs: [ leg(1, "pay", "failed"), leg(2, "pay", "successful") ] }), false)).toBe("paid");

    });

    test("a dead order is failed whatever its legs say", () => {

        expect(receiptPhase(make({ state: "cancelled", legs: [ leg(1, "pay", "pending") ] }), true)).toBe("failed");

    });

    test("pay later with no charge is partial, and settling only while a payment is held", () => {

        expect(receiptPhase(make(), false)).toBe("partial");
        expect(receiptPhase(make(), true)).toBe("settling");
        expect(troubled("partial")).toBe(false);

    });

});
