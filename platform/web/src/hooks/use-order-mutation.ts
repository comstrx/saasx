"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ApiError } from "@/api/core/error";
import orders from "@/api/features/orders";
import { useCheckpoint } from "@/hooks/use-checkpoint";
import { useAction } from "@/hooks/use-operation";
import { z } from "@/lib/providers/schema";
import { identity } from "@/lib/spec/config";
import { orderActions } from "@/lib/std/order-actions";
import { uuid } from "@/lib/std/security";
import { useUi } from "@/stores/provider";

const groups = {
    actions: orderActions, amendments: ["amend", "acceptAmendment", "declineAmendment"], reviews: ["review"],
} as const;
const scopes = { actions: "order-action", amendments: "order-amendment", reviews: "order-review" } as const;
type Group = keyof typeof groups;
type Operation = typeof groups[Group][number];
type Input = z.input<typeof orders.amend.input> & z.input<typeof orders.review.input>
    & { amount?: string; reason?: string; amendmentId?: number; quote_token?: string };
const schema = z.strictObject({
    operation: z.enum([...orderActions, ...groups.amendments, ...groups.reviews]), key: z.string().min(1).max(100),
    uncertain: z.boolean(), blocked: z.boolean(),
    input: z.record(z.string(), z.unknown()),
});

function decode ( target: number, group: Group, value: unknown ) {

    const found = schema.safeParse(value);

    if ( !found.success || found.data.input.orderId !== target ) return null;
    if ( !groups[group].some(( operation ) => operation === found.data.operation) ) return null;

    const input = orders[found.data.operation].input.safeParse(found.data.input);

    return input.success ? { ...found.data, input: input.data as Input } : null;

}
function rejected ( error: ApiError, uncertain: boolean, group: Group ): boolean {

    return !uncertain && (error.kind === "input" || [400, 401, 403, 404, 422, 429].includes(error.status)
        || group === "reviews" && error.status === 409 && ["exists", "invalid_state"].includes(error.reason ?? ""));

}
export function useOrderMutation ( target: number, selected: Operation | null, group: Group = "actions" ) {

    const user = useUi(( state ) => state.user);
    const parser = useCallback(( value: unknown ) => decode(target, group, value), [target, group]);
    const scope = scopes[group];
    const saved = useCheckpoint([identity, scope, user?.id ?? "guest", target].join("."), parser);
    const attempt = saved.value;
    const operation = attempt?.operation ?? selected ?? groups[group][0];
    const action = useAction("orders", operation);
    const running = useRef(false);
    const handled = useRef<ApiError | null>(null);
    const uncertain = !!attempt && (attempt.uncertain || saved.restored);
    const blocked = saved.issue || !!attempt?.blocked;

    useEffect(() => {

        const failure = action.error;

        if ( !failure || handled.current === failure || !attempt ) return;

        handled.current = failure;

        if ( rejected(failure, uncertain, group) ) saved.save(null);
        else saved.save({
            ...attempt, uncertain: true,
            blocked: failure.reason === "key_reused" || !!failure.errors.idempotency_key,
        });

    }, [action.error, attempt, uncertain, group, saved.save]);

    async function run ( input?: Input ) {

        if ( running.current || !saved.ready || blocked || !user || !attempt && (!selected || !input) ) return;

        const candidate = attempt ?? (input ? { operation, input, key: uuid(), uncertain: false, blocked: false } : null);
        const chosen = parser(candidate);

        if ( !chosen || !saved.save({ ...chosen, uncertain }) ) return;

        running.current = true;

        try {

            const answer = await action.run(chosen.input, { idempotencyKey: chosen.key });

            if ( answer ) saved.save(null);

            return answer;

        }
        finally { running.current = false; }

    }

    return {
        ...action, run, attempt, blocked, ready: saved.ready, storageIssue: saved.issue,
        recovery: !!attempt && !action.pending, locked: !!attempt || action.pending || blocked || !saved.ready,
    };

}
