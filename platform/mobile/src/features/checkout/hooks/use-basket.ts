import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { type CartLine, datesLive, type LineFacts, type LineNeed, lineReady } from "@/model/cart";
import { type Applicant, type CheckoutGuests, emptyApplicant, nextApplicantKey } from "@/model/checkout";
import { useCartAmend } from "@/query/cart";
import { useNeeds, useRanged } from "@/query/contract";
import { formatDateSpan, selectDateSpan } from "@/std/date-range";
import { formatDate } from "@/std/number";

type BasketEdit = {
    line: CartLine;
    need: LineNeed;
};

const guestsOf = ( facts: LineFacts ): CheckoutGuests => ({
    adults: facts.adults,
    children: facts.children,
    infants: facts.infants,
    pets: facts.pets ? 1 : 0,
});

export function useBasketController ( lines: readonly CartLine[] ) {

    const { t, i18n } = useTranslation();
    const locale = i18n.language;
    const amend = useCartAmend();
    const needsOf = useNeeds();
    const rangedOf = useRanged();

    const [ edit, setEdit ] = useState<BasketEdit | null>(null);
    const [ draft, setDraft ] = useState<LineFacts | null>(null);
    const [ dropped, setDropped ] = useState<readonly number[]>([]);

    const picked = useCallback(( line: CartLine ) => !dropped.includes(line.id), [ dropped ]);

    const pick = useCallback(( line: CartLine ) => {

        setDropped(( current ) => current.includes(line.id)
            ? current.filter(( id ) => id !== line.id )
            : [ ...current, line.id ] );

    }, []);

    const pending = useCallback(( line: CartLine ): LineNeed | null =>
        needsOf(line.listing.capabilities).find(( need ) => {

            if ( need === "dates" ) return !datesLive(line.facts, rangedOf(line.listing.capabilities));
            if ( need === "guests" ) return line.facts.adults < 1;

            return line.facts.applicants.length === 0;

        }) ?? null, [ needsOf, rangedOf ]);

    const open = useCallback(( line: CartLine, need?: LineNeed ) => {

        const wanted = need ?? pending(line) ?? needsOf(line.listing.capabilities)[0] ?? null;

        if ( !wanted ) return;

        setDraft(wanted === "applicants" && line.facts.applicants.length === 0
            ? { ...line.facts, applicants: [ emptyApplicant("applicant-1") ] }
            : line.facts);

        setEdit({ line, need: wanted });

    }, [ needsOf, pending ]);

    const close = useCallback(() => { setEdit(null); setDraft(null); }, []);

    const save = useCallback(() => {

        if ( !edit || !draft ) return;

        const { line, need } = edit;

        amend.mutate({ id: line.id, facts: draft }, {
            onSuccess: () => {

                const order = needsOf(line.listing.capabilities);
                const next = order[order.indexOf(need) + 1];

                if ( next ) setEdit({ line, need: next });
                else close();

            },
        });

    }, [ amend, close, draft, edit, needsOf ]);

    const chooseDate = useCallback(( iso: string ) => {

        setDraft(( current ) => {

            if ( !current ) return current;

            if ( !edit || !rangedOf(edit.line.listing.capabilities) ) return { ...current, startsAt: iso, endsAt: null };

            const span = selectDateSpan({ start: current.startsAt, end: current.endsAt }, iso);

            return { ...current, startsAt: span.start, endsAt: span.end };

        });

    }, [ edit, rangedOf ]);

    const clearDates = useCallback(() => {
        setDraft(( current ) => current ? { ...current, startsAt: null, endsAt: null } : current );
    }, []);

    const changeGuest = useCallback(( key: keyof CheckoutGuests, delta: number ) => {

        setDraft(( current ) => {

            if ( !current ) return current;
            if ( key === "pets" ) return { ...current, pets: delta > 0 };

            const minimum = key === "adults" ? 1 : 0;

            return { ...current, [key]: Math.max(minimum, current[key] + delta) };

        });

    }, []);

    const addApplicant = useCallback(() => {

        setDraft(( current ) => current && current.applicants.length < 10
            ? { ...current, applicants: [ ...current.applicants, emptyApplicant(nextApplicantKey(current.applicants)) ] }
            : current );

    }, []);

    const dropApplicant = useCallback(( key: string ) => {

        setDraft(( current ) => current && current.applicants.length > 1
            ? { ...current, applicants: current.applicants.filter(( person ) => person.key !== key ) }
            : current );

    }, []);

    const editApplicant = useCallback(( key: string, patch: Partial<Omit<Applicant, "key">> ) => {

        setDraft(( current ) => current
            ? { ...current, applicants: current.applicants.map(( person ) => person.key === key ? { ...person, ...patch } : person ) }
            : current );

    }, []);

    const summaryOf = useCallback(( line: CartLine ): string => {

        const needs = needsOf(line.listing.capabilities);
        const ranged = rangedOf(line.listing.capabilities);
        const live = datesLive(line.facts, ranged);
        const parts: string[] = [];

        if ( needs.includes("dates") && live ) parts.push(ranged
            ? formatDateSpan(locale, { start: line.facts.startsAt, end: line.facts.endsAt })
            : formatDate(locale, line.facts.startsAt, "medium"));
        if ( needs.includes("guests") && live ) parts.push(t("cart.guestsTally", { count: line.facts.adults + line.facts.children }));
        if ( needs.includes("applicants") ) parts.push(t("cart.named", { count: line.facts.applicants.filter(( person ) => person.name.trim().length > 1 ).length }));

        return parts.join(" · ");

    }, [ locale, needsOf, rangedOf, t ]);

    const paramsOf = useCallback(( line: CartLine ) => ({
        catalog: String(line.listing.id),
        quantity: String(line.quantity),
        cart: String(line.id),
    }), []);

    const ready = useCallback(( line: CartLine ) =>
        lineReady(needsOf(line.listing.capabilities), line, rangedOf(line.listing.capabilities)), [ needsOf, rangedOf ]);

    const chosen = lines.filter(picked);

    return {
        edit,
        draft,
        guests: draft ? guestsOf(draft) : null,
        chosen,
        blocked: chosen.filter(( line ) => !ready(line) ),
        busy: amend.isPending,
        picked,
        pick,
        readyOf: ready,
        summaryOf,
        paramsOf,
        open,
        close,
        save,
        chooseDate,
        clearDates,
        changeGuest,
        addApplicant,
        dropApplicant,
        editApplicant,
    } as const;

}
