import { create } from "zustand";
import { ApiError, configure } from "@/api/client";
import type { AuthUser } from "@/api/contracts";
import { account } from "@/api/endpoints/account";
import { i18n } from "@/brand/i18n";
import { notify } from "@/store/notice";
import { usePrefs } from "@/store/prefs";
import { usePush } from "@/store/push";
import { clearToken, readToken, writeToken } from "@/store/vault";

type SessionStore = {
    user: AuthUser | null;
    token: string | null;
    restored: boolean;
    open: ( token: string, user: AuthUser, inherit?: boolean ) => Promise<void>;
    close: () => Promise<void>;
    expire: () => void;
    restore: () => Promise<void>;
};

const forget = async () => {

    await clearToken();
    configure({ token: null, viewer: 0 });
    usePush.getState().clear();

};

const unregister = async () => {

    const device = usePush.getState().registered;

    if ( device ) await account.removeDevice(device).catch(() => null );

};

let leaving = false;

export const useSession = create<SessionStore>(( set ) => ({

    user: null,
    token: null,
    restored: false,

    open: async ( token, user, inherit = false ) => {

        await writeToken(token);
        usePrefs.getState().inherit(inherit ? user.id : null);
        configure({ token, viewer: user.id });
        set({ token, user, restored: true });

    },

    close: async () => {

        leaving = true;

        try {

            await unregister();
            await account.logout().catch(() => null );
            await forget();

        }
        finally {

            leaving = false;

        }

        set({ token: null, user: null });

    },

    expire: () => {

        set(( state ) => {

            if ( state.token && !leaving ) notify(i18n.t("auth.sessionExpired"), "info");

            return { token: null, user: null };

        });
        void forget();

    },

    restore: async () => {

        const token = await readToken();

        configure({ token });
        set({ token, restored: true });

        if ( !token ) return;

        try {

            const user = await account.me();

            configure({ viewer: user.id });
            set({ user });

        }
        catch ( failure ) {

            if ( failure instanceof ApiError && failure.unauthenticated ) await forget();

        }

    },

}));

configure({ onExpire: () => useSession.getState().expire() });
