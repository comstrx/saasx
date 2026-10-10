"use client";

import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-operation";
import { initials } from "@/lib/std/text";
import { useUi } from "@/stores/provider";

export function useAccountMenu () {

    const router = useRouter();
    const ready = useUi(( state ) => state.ready);
    const user = useUi(( state ) => (state.token ? state.user : null));
    const session = useUi(( state ) => state.session);
    const logout = useAction("account", "logout");
    const name = user?.name?.trim() || user?.email || user?.phone || "";

    async function leave () {

        await logout.run({});
        session(null, null);
        router.refresh();

    }

    return {
        ready,
        user: user ? {
            name, contact: user.email || user.phone || "", image: user.image ?? null, initials: initials(name),
            verified: user.verified === true,
        } : null,
        leaving: logout.pending,
        leave,
    };

}
