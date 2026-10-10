import { openURL } from "expo-linking";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { type PaymentIntent, type PaymentKind, type PaymentTarget, paymentKind, settleTick, settling, targets } from "@/model/payment";
import { itemsOf } from "@/query/shelf";
import { useTransactions } from "@/query/wallet";
import { clearPayment, holdPayment, usePendingPayment } from "@/store/payment";

export const settlePayment = ( intent: PaymentIntent, target: PaymentTarget ): PaymentKind => {

    const kind = paymentKind(intent);

    if ( kind === "settled" ) { clearPayment(); return kind; }

    holdPayment(target);

    if ( intent.url ) void openURL(intent.url);

    return kind;

};

export function useSettling ( target: PaymentTarget | null ): boolean {

    const pending = usePendingPayment(( state ) => state.pending );

    if ( !target ) return false;

    return targets(pending, target) && settling(pending, Date.now());

}

export function useReturn ( onReturn: () => void, active = true ) {

    const held = useRef(onReturn);

    useEffect(() => { held.current = onReturn; });

    useEffect(() => {

        if ( !active ) return;

        const watcher = AppState.addEventListener("change", ( status ) => {

            if ( status === "active" ) held.current();

        });

        return () => watcher.remove();

    }, [ active ]);

}

const purse: PaymentTarget = { kind: "wallet", reference: "" };

export function useWalletSettling (): boolean {

    const pending = usePendingPayment(( state ) => state.pending );
    const held = pending?.target.kind === "wallet" ? pending.target.reference : "";
    const open = targets(pending, purse) && settling(pending, Date.now());

    const flow = useTransactions(open);
    const rows = flow.data ? itemsOf(flow.data) : null;
    const reload = flow.refetch;

    useEffect(() => {

        if ( !open || !held || !rows ) return;

        const row = rows.find(( entry ) => entry.reference === held );

        if ( row && row.state !== "pending" ) clearPayment();

    }, [ held, open, rows ]);

    useEffect(() => {

        if ( !open ) return;

        const timer = setInterval(() => { void reload(); }, settleTick * 2);

        return () => clearInterval(timer);

    }, [ open, reload ]);

    return open;

}
