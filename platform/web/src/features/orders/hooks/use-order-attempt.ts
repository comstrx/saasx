"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ApiError } from "@/api/core/error";
import cart from "@/api/features/cart";
import orders, { placed } from "@/api/features/orders";
import { useCheckpoint } from "@/hooks/use-checkpoint";
import { useAction } from "@/hooks/use-operation";
import { z } from "@/lib/providers/schema";
import { identity } from "@/lib/spec/config";
import { uuid } from "@/lib/std/security";
import { parseUrl } from "@/lib/std/url";
import { useUi } from "@/stores/provider";

type Operation = keyof typeof endpoints;
type Input<O extends Operation> = z.input<(typeof endpoints)[O]["input"]>;
export type PurchaseAttempt = ReturnType<typeof useOrderAttempt<"checkout" | "cart">>;
type Receipt = { orderId: number; failed: boolean; href?: string };
type Attempt<O extends Operation> =
    | { state: "pending"; input: Input<O>; uncertain: boolean; blocked: boolean; currency?: string }
    | { state: "complete"; receipt: Receipt };

const endpoints = { checkout: orders.checkout, pay: orders.pay, cart: cart.checkout };
const receipt = z.strictObject({
    orderId: z.number().int().positive(), failed: z.boolean(), href: z.string().refine(( value ) => !!parseUrl(value)).optional(),
});

function decode<O extends Operation> ( operation: O, target: number, value: unknown ): Attempt<O> | null {

    const schema = z.discriminatedUnion("state", [
        z.strictObject({ state: z.literal("complete"), receipt }),
        z.strictObject({
            state: z.literal("pending"), input: endpoints[operation].input,
            uncertain: z.boolean(), blocked: z.boolean(), currency: z.string().regex(/^[A-Z]{3}$/).optional(),
        }),
    ]);
    const parsed = schema.safeParse(value);

    if ( !parsed.success ) return null;

    if ( parsed.data.state === "complete" ) {

        return operation === "pay" && parsed.data.receipt.orderId !== target ? null : parsed.data;

    }

    const input = parsed.data.input;
    const id = "cartId" in input ? input.cartId : "productId" in input ? input.productId : input.orderId;

    if ( id !== target || !input.quote_token || !input.idempotency_key ) return null;

    return parsed.data as Attempt<O>;

}
function completion ( operation: Operation, target: number, resource: unknown, failed = false ): Receipt | null {

    const parsed = operation === "pay" ? orders.pay.output.safeParse(resource) : placed.safeParse(resource);

    if ( !parsed.success ) return null;

    const result = parsed.data;
    const payment = "order" in result ? result.payment : result;
    const url = payment?.pay_url || payment?.pay_data?.pay_url;
    const href = url ? parseUrl(url)?.href : undefined;

    return { orderId: "order" in result ? result.order.id : target, failed, ...(href ? { href } : {}) };

}
function rejected ( error: ApiError, uncertain: boolean ): boolean {

    if ( error.confirmation || error.status === 422 && error.errors.confirm_code ) return true;
    if ( uncertain ) return false;

    return error.kind === "input" || [400, 401, 403, 404, 422, 429].includes(error.status);

}
export function useOrderAttempt<O extends Operation> ( operation: O, target: number ) {

    const user = useUi(( state ) => state.user);
    const normal = useAction("orders", operation === "pay" ? "pay" : "checkout");
    const fromCart = useAction("cart", "checkout");
    const action = operation === "cart" ? fromCart : normal;
    const parser = useCallback(( value: unknown ) => decode(operation, target, value), [operation, target]);
    const key = [identity, "orders", user?.id ?? "guest", operation, target].join(".");
    const saved = useCheckpoint(key, parser);
    const handled = useRef<ApiError | null>(null);
    const running = useRef(false);
    const attempt = saved.value?.state === "pending" ? saved.value : null;
    const result = saved.value?.state === "complete" ? saved.value.receipt : null;
    const uncertain = !!attempt && (attempt.uncertain || saved.restored);
    const blocked = saved.issue || !!attempt?.blocked;

    useEffect(() => {

        const failure = action.error;

        if ( !failure || handled.current === failure || !attempt ) return;

        handled.current = failure;

        const result = failure.resource ? completion(operation, target, failure.resource, true) : null;

        if ( result ) saved.save({ state: "complete", receipt: result });
        else if ( rejected(failure, uncertain) ) saved.save(null);
        else saved.save({
            ...attempt, uncertain: true,
            blocked: !!failure.errors.quote_token || !!failure.errors.idempotency_key
                || failure.reason === "key_reused",
        });

    }, [action.error, attempt, uncertain, operation, target, saved.save]);

    async function run ( input?: Input<O>, currency?: string ) {

        if ( running.current || !saved.ready || blocked || result || !user || !attempt && !input ) return;

        const candidate = attempt ?? (input ? {
            state: "pending" as const, input: { ...input, idempotency_key: uuid() }, uncertain: false, blocked: false, currency,
        } : null);
        const chosen = candidate ? parser(candidate) : null;

        if ( chosen?.state !== "pending" || !saved.save({ ...chosen, uncertain }) ) return;

        running.current = true;

        try {

            const options = { idempotencyKey: chosen.input.idempotency_key };
            const answer = operation === "cart" ? await fromCart.run(cart.checkout.input.parse(chosen.input), options)
                : await normal.run(orders[operation === "pay" ? "pay" : "checkout"].input.parse(chosen.input), options);

            if ( answer ) {

                const result = completion(operation, target, answer.resource);

                if ( result ) saved.save({ state: "complete", receipt: result });

            }

        }
        finally {

            running.current = false;

        }

    }
    function restart () {

        if ( !result || action.pending || blocked || !saved.save(null) ) return false;

        action.clear();

        return true;

    }

    return {
        ...action, run, restart, attempt, receipt: result, ready: saved.ready, blocked,
        storageIssue: saved.issue,
        unresolved: !!attempt && !action.pending, locked: !saved.ready || !!attempt || !!result || blocked,
    };

}
