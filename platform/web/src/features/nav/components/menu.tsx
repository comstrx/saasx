"use client";

import { localePath } from "engine/translate";
import { usePathname } from "next/navigation";
import NavBar from "@/components/nav-bar";
import { useSession } from "@/hooks/use-client";
import { useLocale } from "@/hooks/use-locale";
import { routing } from "@/lib/spec/config";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { brand: string; home: string; login: string; account: string };

export default function Menu ({ options }: FeatureProps<Options>) {

    const locale = useLocale();
    const pathname = usePathname();
    const { ready, user } = useSession();
    const home = localePath(locale, "/", routing);
    const signedIn = ready && user !== null;

    return (

        <NavBar
            brand={options.brand}
            items={[{ href: home, label: options.home, current: pathname === home }]}
            action={signedIn ? { href: home, label: options.account } : { href: localePath(locale, "/login", routing), label: options.login }}
        />

    );

}
