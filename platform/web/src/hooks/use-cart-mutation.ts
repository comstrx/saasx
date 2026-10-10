"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiError } from "@/api/core/error";
import cart from "@/api/features/cart";
import { useCheckpoint } from "@/hooks/use-checkpoint";
import { useAction } from "@/hooks/use-operation";
import { z } from "@/lib/providers/schema";
import { identity } from "@/lib/spec/config";
import { uuid } from "@/lib/std/security";
import { useUi } from "@/stores/provider";

const schema = z.strictObject({
    operation: z.enum(["add", "update", "delete", "clear", "increment", "decrement"]),
    input: z.record(z.string(), z.unknown()), key: z.string().min(1).max(100),
    uncertain: z.boolean(), blocked: z.boolean(),
});
type Operation = z.output<typeof schema>["operation"];
type Input = z.input<(typeof cart)[Operation]["input"]>;

function decode ( value: unknown ) {

    const result = schema.safeParse(value);

    if ( !result.success ) return null;

    const input = cart[result.data.operation].input.safeParse(result.data.input);

    return input.success ? { ...result.data, input: input.data as Input } : null;

}
function rejected ( error: ApiError, uncertain: boolean ): boolean {

    return !uncertain && (error.kind === "input" || [400, 401, 403, 404, 410, 422, 429].includes(error.status));

}
export function useCartMutation ( scope: string ) {

    const user = useUi(( state ) => state.user);
    const token = useUi(( state ) => state.token);
    const parser = useCallback(decode, []);
    const saved = useCheckpoint([identity, "cart", user?.id ?? "guest", scope].join("."), parser);
    const attempt = saved.value;
    const [selectedOperation, setSelectedOperation] = useState<Operation>("update");
    const operation = attempt?.operation ?? selectedOperation;
    const commands = {
        add: useAction("cart", "add"), update: useAction("cart", "update"), delete: useAction("cart", "delete"),
        clear: useAction("cart", "clear"), increment: useAction("cart", "increment"), decrement: useAction("cart", "decrement"),
    };
    const command = commands[operation];
    const running = useRef(false);
    const handled = useRef<ApiError | null>(null);
    const uncertain = !!attempt && (attempt.uncertain || saved.restored);
    const blocked = saved.issue || !!attempt?.blocked;
    const error = command.error;

    useEffect(() => {

        if ( !error || handled.current === error || !attempt ) return;

        handled.current = error;

        if ( rejected(error, uncertain) ) saved.save(null);
        else saved.save({ ...attempt, uncertain: true, blocked: error.reason === "key_reused" });

    }, [error, attempt, uncertain, saved.save]);

    async function run ( selected?: Operation, input?: Input ) {

        if ( running.current || !saved.ready || blocked || !user || !token || !attempt && (!selected || !input) ) return;

        const next = attempt ?? (selected && input ? { operation: selected, input, key: uuid(), uncertain: false, blocked: false } : null);
        const chosen = decode(next);

        if ( !chosen || !saved.save({ ...chosen, uncertain }) ) return;

        setSelectedOperation(chosen.operation);
        running.current = true;

        try {

            const options = { idempotencyKey: chosen.key };
            const result = await (chosen.operation === "add" ? commands.add.run(cart.add.input.parse(chosen.input), options)
                : chosen.operation === "update" ? commands.update.run(cart.update.input.parse(chosen.input), options)
                : chosen.operation === "delete" ? commands.delete.run(cart.delete.input.parse(chosen.input), options)
                : chosen.operation === "clear" ? commands.clear.run(cart.clear.input.parse(chosen.input), options)
                : chosen.operation === "increment" ? commands.increment.run(cart.increment.input.parse(chosen.input), options)
                : commands.decrement.run(cart.decrement.input.parse(chosen.input), options));

            if ( result ) saved.save(null);

            return result;

        }
        finally { running.current = false; }

    }

    return {
        run, attempt, error, blocked, ready: saved.ready,
        pending: Object.values(commands).some(( action ) => action.pending),
        locked: !!attempt || running.current || blocked || !saved.ready,
        clear: () => {

            for ( const action of Object.values(commands) ) {

                action.clear();

            }

        },
    };

}
