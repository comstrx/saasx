import { useCallback, useEffect, useState } from "react";
import {
    type Applicant,
    applicantsReady,
    type CheckoutGuests,
    type CheckoutPanel,
    type CheckoutPaymentPlan,
    type CheckoutPaymentSource,
    type CheckoutSeed,
    type CheckoutSelection,
    datesSettled,
    emptyApplicant,
    guestDraftValid,
    initialCheckoutSelection,
    nextApplicantKey,
} from "@/model/checkout";
import { type DateSpan, selectDateSpan } from "@/std/date-range";

export function useCheckoutController (
    seed: CheckoutSeed,
    gatewayIds: readonly number[],
    capacity: number,
    walletUsable: boolean,
    ranged = true,
) {

    const [ selection, setSelection ] = useState<CheckoutSelection>(() => initialCheckoutSelection(seed));
    const [ panel, setPanel ] = useState<CheckoutPanel>(null);
    const [ dateDraft, setDateDraft ] = useState<DateSpan>(selection.dates);
    const [ guestDraft, setGuestDraft ] = useState<CheckoutGuests>(selection.guests);
    const [ paymentPlan, setPaymentPlan ] = useState<CheckoutPaymentPlan>("full");
    const [ paymentSource, setPaymentSource ] = useState<CheckoutPaymentSource>("wallet");
    const [ gateway, setGateway ] = useState<number | null>(null);
    const [ coupon, setCoupon ] = useState("");
    const [ applicants, setApplicants ] = useState<readonly Applicant[]>(
        () => seed.applicants?.length ? seed.applicants : [ emptyApplicant("applicant-1") ],
    );

    useEffect(() => {

        if ( gateway !== null && gatewayIds.includes(gateway) ) return;

        setGateway(gatewayIds[0] ?? null);

    }, [ gateway, gatewayIds ]);

    useEffect(() => {

        setPaymentSource(( current ) => {

            if ( !walletUsable ) return current === "wallet" ? "gateway" : current;

            return current === "gateway" && gatewayIds.length === 0 ? "wallet" : current;

        });

    }, [ walletUsable, gatewayIds ]);

    const openDates = useCallback(() => {

        setDateDraft(selection.dates);
        setPanel("dates");

    }, [ selection.dates ]);

    const openGuests = useCallback(() => {

        setGuestDraft(selection.guests);
        setPanel("guests");

    }, [ selection.guests ]);

    const openCoupon = useCallback(() => setPanel("coupon"), []);

    const closePanel = useCallback(() => setPanel(null), []);

    const applyCoupon = useCallback(( code: string ) => {

        setCoupon(code);
        setPanel(null);

    }, []);

    const clearCoupon = useCallback(() => setCoupon(""), []);

    const chooseDate = useCallback(( iso: string ) => {
        setDateDraft(( current ) => ranged ? selectDateSpan(current, iso) : { start: iso, end: iso } );
    }, [ ranged ]);

    const clearDates = useCallback(() => setDateDraft({ start: null, end: null }), []);

    const dateDraftReady = datesSettled(dateDraft, ranged);

    const saveDates = useCallback(() => {

        if ( !datesSettled(dateDraft, ranged) ) return;

        setSelection(( current ) => ({ ...current, dates: dateDraft }) );
        setPanel(null);

    }, [ dateDraft, ranged ]);

    const changeGuest = useCallback(( key: keyof CheckoutGuests, delta: number ) => {

        setGuestDraft(( current ) => {

            const minimum = key === "adults" ? 1 : 0;
            const maximum = key === "pets" ? 1 : key === "infants" ? 5 : 16;
            const next = Math.min(maximum, Math.max(minimum, current[key] + delta));
            const candidate = { ...current, [key]: next };

            if ( key !== "infants" && key !== "pets" && capacity > 0
                && candidate.adults + candidate.children > capacity ) return current;

            return candidate;

        });

    }, [ capacity ]);

    const addApplicant = useCallback(() => {

        setApplicants(( current ) => current.length >= 10
            ? current
            : [ ...current, emptyApplicant(nextApplicantKey(current)) ] );

    }, []);

    const dropApplicant = useCallback(( key: string ) => {

        setApplicants(( current ) => current.length <= 1 ? current : current.filter(( person ) => person.key !== key ) );

    }, []);

    const editApplicant = useCallback(( key: string, patch: Partial<Omit<Applicant, "key">> ) => {

        setApplicants(( current ) => current.map(( person ) => person.key === key ? { ...person, ...patch } : person ) );

    }, []);

    const saveGuests = useCallback(() => {

        if ( !guestDraftValid(guestDraft, capacity) ) return;

        setSelection(( current ) => ({ ...current, guests: guestDraft }) );
        setPanel(null);

    }, [ capacity, guestDraft ]);

    return {
        selection,
        panel,
        coupon,
        applicants,
        dateDraft,
        guestDraft,
        paymentPlan,
        paymentSource,
        gateway,
        openDates,
        openGuests,
        openCoupon,
        applyCoupon,
        clearCoupon,
        closePanel,
        chooseDate,
        clearDates,
        saveDates,
        changeGuest,
        saveGuests,
        addApplicant,
        dropApplicant,
        editApplicant,
        setPaymentPlan,
        setPaymentSource,
        setGateway,
        datesReady: dateDraftReady,
        guestsReady: guestDraftValid(guestDraft, capacity),
        applicantsReady: applicantsReady(applicants),
    } as const;

}
