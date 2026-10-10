import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wallet } from "@/api/endpoints/wallet";
import { wireAmount } from "@/model/currency";
import { intentOf } from "@/model/payment";
import { shelve } from "@/model/shelf";
import { balanceOf, flowOf, type LedgerEntry, ledgerOf, railOf, recipientOf, transactionOf } from "@/model/wallet";
import { nextPage } from "@/query/shelf";
import { useSigned } from "@/query/wire";
import { contactable } from "@/std/identity";
import { key } from "@/std/key";

const hour = 3600000;

const walletKeys = {
    balance: [ "wallet", "balance" ] as const,
    rails: [ "wallet", "rails" ] as const,
    recipient: ( term: string ) => [ "wallet", "recipient", term ] as const,
    transactions: [ "wallet", "transactions" ] as const,
    statement: [ "wallet", "statement" ] as const,
    flow: [ "wallet", "flow" ] as const,
};

type Deposit = {
    rail: number;
    amount: number;
    currency: string;
    details: Readonly<Record<string, string>>;
    attempt: string;
};

type Withdraw = {
    rail: number;
    amount: number;
    currency: string;
    recipient: Readonly<Record<string, string>>;
    attempt: string;
    code: string | null;
};

type Transfer = {
    recipient: string;
    amount: number;
    currency: string;
    attempt: string;
    code: string | null;
};

type Refund = {
    leg: number;
    attempt: string;
    code: string | null;
};

export function useBalance () {

    const signed = useSigned();

    return useQuery({
        queryKey: walletKeys.balance,
        queryFn: async () => balanceOf(await wallet.balance()),
        enabled: signed,
    });

}

export function useStatement ( enabled = true ) {

    const signed = useSigned();

    return useInfiniteQuery({
        queryKey: walletKeys.statement,
        queryFn: async ({ pageParam }) => shelve(await wallet.statement(pageParam), ( rows ) => rows.map(ledgerOf)),
        initialPageParam: 1,
        getNextPageParam: nextPage,
        enabled: signed && enabled,
    });

}

export function useFlow ( span = 7 ) {

    const signed = useSigned();

    return useQuery({
        queryKey: walletKeys.flow,
        queryFn: async () => shelve(await wallet.statement(1, 100), ( rows ) => rows.map(ledgerOf) ).items,
        select: ( entries: readonly LedgerEntry[] ) => ({ days: flowOf(entries, span), recent: entries.slice(0, 4) }),
        enabled: signed,
    });

}

export function useTransactions ( enabled = true ) {

    const signed = useSigned();

    return useInfiniteQuery({
        queryKey: walletKeys.transactions,
        queryFn: async ({ pageParam }) => shelve(await wallet.transactions(pageParam), ( rows ) => rows.map(transactionOf)),
        initialPageParam: 1,
        getNextPageParam: nextPage,
        enabled: signed && enabled,
    });

}

export function useRails ( enabled: boolean ) {

    return useQuery({
        queryKey: walletKeys.rails,
        queryFn: async () => ( await wallet.rails() ).map(railOf),
        staleTime: hour,
        enabled,
    });

}

export function useRecipient ( term: string ) {

    const settled = term.trim();

    return useQuery({
        queryKey: walletKeys.recipient(settled),
        queryFn: async () => recipientOf(await wallet.resolve(settled)),
        enabled: contactable(settled),
        retry: false,
        staleTime: 60000,
    });

}

export function useCancelTransaction () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ( id: number ) => wallet.cancel(id, key.attempt(`transaction-cancel:${ id }`)),
        onSettled: () => { cache.invalidateQueries({ queryKey: [ "wallet" ] }); },
    });

}

export function useDeposit () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: async ({ rail, amount, currency, details, attempt }: Deposit) =>
            intentOf(await wallet.deposit(rail, wireAmount(amount, currency), currency, details, attempt)),
        meta: { quiet: true },
        onSettled: () => { cache.invalidateQueries({ queryKey: [ "wallet" ] }); },
    });

}

export function useWithdraw () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: async ({ rail, amount, currency, recipient, attempt, code }: Withdraw) =>
            intentOf(await wallet.withdraw(rail, wireAmount(amount, currency), currency, recipient, code, attempt)),
        meta: { quiet: true },
        onSettled: () => { cache.invalidateQueries({ queryKey: [ "wallet" ] }); },
    });

}

export function useTransfer () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ({ recipient, amount, currency, attempt, code }: Transfer) => wallet.transfer(recipient, wireAmount(amount, currency), attempt, code),
        meta: { quiet: true },
        onSettled: () => { cache.invalidateQueries({ queryKey: [ "wallet" ] }); },
    });

}

export function useRefund () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ({ leg, attempt, code }: Refund) => wallet.refund(leg, attempt, code),
        meta: { quiet: true },
        onSettled: () => {

            cache.invalidateQueries({ queryKey: [ "orders" ] });
            cache.invalidateQueries({ queryKey: [ "wallet" ] });

        },
    });

}

export function useWalletRefresh () {

    const cache = useQueryClient();

    return () => { cache.invalidateQueries({ queryKey: [ "wallet" ] }); };

}
