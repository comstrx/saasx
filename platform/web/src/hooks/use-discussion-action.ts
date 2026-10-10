"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ApiError } from "@/api/core/error";
import reviews, { comments, replies } from "@/api/features/reviews";
import { useCheckpoint } from "@/hooks/use-checkpoint";
import { useAction } from "@/hooks/use-operation";
import { z } from "@/lib/providers/schema";
import { identity } from "@/lib/spec/config";
import { uuid } from "@/lib/std/security";
import { useUi } from "@/stores/provider";

const endpoints = { reviews, replies, comments } as const;
const schema = z.strictObject({
    feature: z.enum(["reviews", "replies", "comments"]),
    operation: z.enum(["update", "remove", "restore", "reply", "like", "dislike", "unreact", "report"]),
    input: z.record(z.string(), z.unknown()), key: z.string().min(1).max(100),
    uncertain: z.boolean(), blocked: z.boolean(),
});
type Feature = keyof typeof endpoints;
type Operation = z.output<typeof schema>["operation"];
type Input = z.input<(typeof reviews)[Operation]["input"] | (typeof replies)[Operation]["input"] | (typeof comments)[Operation]["input"]>;
export type DiscussionAction = { feature: Feature; operation: Operation };

function decode ( value: unknown ) {

    const parsed = schema.safeParse(value);

    if ( !parsed.success ) return null;

    const input = endpoints[parsed.data.feature][parsed.data.operation].input.safeParse(parsed.data.input);

    return input.success ? { ...parsed.data, input: input.data as Input } : null;

}
function rejected ( error: ApiError, uncertain: boolean ): boolean {

    return !uncertain && (error.kind === "input" || [400, 401, 403, 404, 410, 422, 429].includes(error.status));

}
export function useDiscussionAction ( scope: string, selected: DiscussionAction | null ) {

    const user = useUi(( state ) => state.user);
    const parser = useCallback(decode, []);
    const saved = useCheckpoint([identity, "discussion", user?.id ?? "guest", scope].join("."), parser);
    const attempt = saved.value;
    const feature = attempt?.feature ?? selected?.feature ?? "reviews";
    const operation = attempt?.operation ?? selected?.operation ?? "update";
    const command = useAction(feature, operation);
    const running = useRef(false);
    const handled = useRef<ApiError | null>(null);
    const uncertain = !!attempt && (attempt.uncertain || saved.restored);
    const blocked = saved.issue || !!attempt?.blocked;

    useEffect(() => {

        const failure = command.error;

        if ( !failure || handled.current === failure || !attempt ) return;

        handled.current = failure;

        if ( rejected(failure, uncertain) ) saved.save(null);
        else saved.save({ ...attempt, uncertain: true, blocked: failure.reason === "key_reused" });

    }, [command.error, attempt, uncertain, saved.save]);

    async function run ( input?: Input ) {

        if ( running.current || !saved.ready || blocked || !user || !attempt && (!selected || !input) ) return;

        const next = attempt ?? (selected && input ? { ...selected, input, key: uuid(), uncertain: false, blocked: false } : null);
        const candidate = decode(next);

        if ( !candidate || !saved.save({ ...candidate, uncertain }) ) return;

        running.current = true;

        try {

            const result = await command.run(candidate.input, { idempotencyKey: candidate.key });

            if ( result ) saved.save(null);

            return result;

        }
        finally { running.current = false; }

    }

    return {
        ...command, run, attempt, blocked, ready: saved.ready, feature, operation,
        locked: !!attempt || command.pending || blocked || !saved.ready,
    };

}
