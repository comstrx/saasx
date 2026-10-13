"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import SearchBar from "@/components/search-bar";
import { useSignal } from "@/hooks/use-signal";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { placeholder: string; go: string; mode: string };

export default function Box ({ options, route }: FeatureProps<Options>) {

    const router = useRouter();
    const pathname = usePathname();
    const [live, emit] = useSignal<string>("search");
    const initial = typeof route.query.search === "string" ? route.query.search : (live ?? "");
    const search = ( value: string ): void => {

        if ( options.mode === "signal" ) emit(value);
        else router.push((value ? `${pathname}?search=${encodeURIComponent(value)}` : pathname) as Route);

    };

    return <SearchBar initial={initial} placeholder={options.placeholder} go={options.go} onSearch={search} />;

}
