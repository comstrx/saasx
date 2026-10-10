"use client";

import { useState } from "react";
import { useAction } from "@/hooks/use-operation";

type Duration = "monthly" | "yearly" | "lifetime";

export function usePlanBoard ( initial: Duration, durations: readonly Duration[] ) {

    const visit = useAction("plans", "visit");
    const [duration, setDuration] = useState<Duration>(durations.includes(initial) ? initial : durations[0] ?? "monthly");

    function pick ( value: string ) {

        const found = durations.find(( entry ) => entry === value);

        if ( found ) setDuration(found);

    }
    function choose ( planId: number ) {

        void visit.run({ planId }).catch(() => undefined);

    }

    return { duration, pick, choose, mark: ( featured: boolean ) => (featured ? "accent" as const : "success" as const) };

}
