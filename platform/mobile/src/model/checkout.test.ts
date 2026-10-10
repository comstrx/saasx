import { availabilityFrom, closedOn, priceOn, spanOpen } from "@/model/availability";
import { type Applicant, datesSettled, emptyApplicant, nextApplicantKey } from "@/model/checkout";
import { rangedFrom } from "@/model/requirement";
import { validDateSpan } from "@/std/date-range";

const add = ( applicants: readonly Applicant[] ): readonly Applicant[] => [ ...applicants, emptyApplicant(nextApplicantKey(applicants)) ];

const drop = ( applicants: readonly Applicant[], key: string ): readonly Applicant[] => applicants.filter(( person ) => person.key !== key );

describe("applicant keys", () => {

    test("a drop then an add never reuses a living key", () => {

        const three = add(add([ emptyApplicant("applicant-1") ]));
        const after = add(drop(three, "applicant-2"));
        const keys = after.map(( person ) => person.key );

        expect(new Set(keys).size).toBe(keys.length);
        expect(keys).toEqual([ "applicant-1", "applicant-3", "applicant-4" ]);

    });

    test("the first key of an empty list is applicant-1", () => {

        expect(nextApplicantKey([])).toBe("applicant-1");

    });

});

describe("dates", () => {

    test("an expired saved range cannot be saved again, while tomorrow and a single date remain valid", () => {

        const minimum = "2026-09-24";

        expect(validDateSpan({ start: "2026-09-21", end: "2026-09-22" }, true, minimum)).toBe(false);
        expect(validDateSpan({ start: "2026-09-23", end: "2026-09-25" }, true, minimum)).toBe(false);
        expect(validDateSpan({ start: "2026-09-24", end: "2026-09-25" }, true, minimum)).toBe(true);
        expect(validDateSpan({ start: "2026-09-24", end: null }, false, minimum)).toBe(true);
        expect(validDateSpan({ start: "2026-09-25", end: "2026-09-24" }, true, minimum)).toBe(false);

    });

    test("calendar prices retain the currency of the displayed money, including when the root differs", () => {

        const calendar = availabilityFrom({
            currency: "USD",
            days: [
                { date: "2026-09-24", price: { amount: "125", currency: "USD", display: { amount: "6263", currency: "EGP" } } },
                { date: "2026-09-25", price: null },
            ],
        });

        expect(priceOn(calendar, "2026-09-24")).toEqual({ amount: 6263, currency: "EGP" });
        expect(priceOn(calendar, "2026-09-25")).toBeNull();
        expect(priceOn(calendar, "2026-09-26")).toBeNull();

    });

    test("a single-date item is settled by its start alone, even after a change sets end to start", () => {

        expect(datesSettled({ start: "2026-10-02", end: "2026-10-02" }, false)).toBe(true);
        expect(datesSettled({ start: "2026-10-02", end: null }, false)).toBe(true);
        expect(datesSettled({ start: null, end: null }, false)).toBe(false);

    });

    test("a ranged item needs at least one night", () => {

        expect(datesSettled({ start: "2026-10-02", end: "2026-10-02" }, true)).toBe(false);
        expect(datesSettled({ start: "2026-10-02", end: "2026-10-05" }, true)).toBe(true);

    });

    test("a closed day refuses a single date and any span that covers it", () => {

        const calendar = availabilityFrom({
            currency: "USD",
            days: [
                { date: "2026-10-02", open: true, units: null, price: "20" },
                { date: "2026-10-03", open: false, units: 0, price: "20" },
                { date: "2026-10-04", open: true, units: null, price: "20" },
            ],
        });

        expect(spanOpen(calendar, "2026-10-03", "2026-10-03")).toBe(false);
        expect(spanOpen(calendar, "2026-10-02", "2026-10-02")).toBe(true);
        expect(spanOpen(calendar, "2026-10-02", "2026-10-04")).toBe(false);
        expect(spanOpen(calendar, "2026-10-04", "2026-10-06")).toBe(true);

    });

    test("a sold-out day refuses like a closed one", () => {

        const calendar = availabilityFrom({
            currency: "USD",
            days: [
                { date: "2026-10-02", open: true, units: 3, price: "20" },
                { date: "2026-10-03", open: true, units: 0, price: "20" },
            ],
        });

        expect(closedOn(calendar, "2026-10-03")).toBe(true);
        expect(closedOn(calendar, "2026-10-02")).toBe(false);
        expect(spanOpen(calendar, "2026-10-02", "2026-10-04")).toBe(false);

    });

});

describe("ranged by the contract", () => {

    const rule = ( required: boolean ) => ({ required, when: null, drives: null, multiplies: null });

    const requirements = {
        bookable: { starts_at: rule(false) },
        lodging: { ends_at: rule(true) },
        underwritten: { starts_at: rule(true), ends_at: rule(true) },
        processable: { applicants: rule(false) },
    };

    test("a capability that requires an end date makes the booking a span", () => {

        expect(rangedFrom(requirements, [ "bookable", "lodging" ])).toBe(true);
        expect(rangedFrom(requirements, [ "bookable", "underwritten" ])).toBe(true);
        expect(rangedFrom(requirements, [ "bookable", "processable" ])).toBe(false);
        expect(rangedFrom(requirements, [])).toBe(false);

    });

});
