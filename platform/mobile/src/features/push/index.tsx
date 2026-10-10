import { requireOptionalNativeModule } from "expo";
import Constants from "expo-constants";
import { type Href, router } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import { queries } from "@/query";
import { useRegisterDevice } from "@/query/account";
import { usePrefs } from "@/store/prefs";
import { usePush } from "@/store/push";
import { useSession } from "@/store/session";

type Notifications = typeof import("expo-notifications");

type Register = ReturnType<typeof useRegisterDevice>["mutateAsync"];

declare const require: ( id: string ) => unknown;

const channel = "default";

let loaded: Notifications | null | undefined;

const load = (): Notifications | null => {

    if ( loaded !== undefined ) return loaded;

    loaded = requireOptionalNativeModule("ExpoPushTokenManager") ? require("expo-notifications") as Notifications : null;

    return loaded;

};

const projectId = (): string | null =>
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? null;

const platformOf = () => Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web";

const landings: Record<string, ( id: string ) => string> = {
    order: ( id ) => `/order/${ id }`,
    catalog: ( id ) => `/catalog/${ id }`,
    ticket: ( id ) => `/ticket/${ id }`,
    room: ( id ) => `/room/${ id }`,
    chat: ( id ) => `/room/${ id }`,
    message: ( id ) => `/room/${ id }`,
    transaction: () => "/wallet/transactions",
    wallet: () => "/wallet",
    coupon: () => "/coupons",
    referral: () => "/referrals",
    level: () => "/level",
    session: () => "/sessions",
    identity: () => "/personal",
    account: () => "/account",
};

const inbox = "/notifications";

const routeOf = ( data: Record<string, unknown> | undefined ): Href | null => {

    if ( !data ) return null;

    const related = typeof data.related === "string" ? data.related : "";
    const id = data.related_id === undefined || data.related_id === null ? "" : String(data.related_id);
    const land = landings[related];

    if ( land ) return ( id || !related ? land(id) : inbox ) as Href;

    const raw = data.url ?? data.route ?? data.path;

    if ( typeof raw !== "string" || !raw ) return inbox as Href;

    const path = raw.replace(/^[a-z+.-]+:\/\//i, "").replace(/^\/+/, "");
    const [ head = "", tail = "" ] = path.split("/");
    const known = landings[head];

    return ( known ? known(tail) : inbox ) as Href;

};

const refresh = () => {

    void queries.invalidateQueries({ queryKey: [ "notifications" ] });

};

async function enroll ( pushed: Notifications, locale: string, register: Register ): Promise<void> {

    const held = await pushed.getPermissionsAsync();
    const granted = held.granted || ( await pushed.requestPermissionsAsync() ).granted;

    if ( !granted ) return;

    if ( Platform.OS === "android" ) {

        await pushed.setNotificationChannelAsync(channel, {
            name: channel,
            importance: pushed.AndroidImportance.MAX,
            vibrationPattern: [ 0, 180, 120, 180 ],
        });

    }

    const project = projectId();
    const minted = await pushed.getExpoPushTokenAsync(project ? { projectId: project } : {});
    const token = minted.data;

    if ( !token || usePush.getState().registered === token ) return;

    await register({ token, platform: platformOf(), locale });

    usePush.getState().settle(token);

}

export function Push () {

    const token = useSession(( state ) => state.token );
    const language = usePrefs(( state ) => state.language );
    const busy = useRef(false);
    const { mutateAsync: register } = useRegisterDevice();

    useEffect(() => {

        const pushed = load();

        if ( !pushed ) return;

        pushed.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowBanner: true,
                shouldShowList: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            }),
        });

        const landed = pushed.addNotificationReceivedListener(refresh);

        const opened = pushed.addNotificationResponseReceivedListener(( response ) => {

            refresh();

            const route = routeOf(response.notification.request.content.data);

            if ( route ) router.push(route);

        });

        void pushed.getLastNotificationResponseAsync().then(( response ) => {

            const route = response ? routeOf(response.notification.request.content.data) : null;

            if ( route ) router.push(route);

        });

        return () => {

            landed.remove();
            opened.remove();

        };

    }, []);

    useEffect(() => {

        if ( !token ) return;

        const pushed = load();

        if ( !pushed ) return;

        const attempt = () => {

            if ( busy.current ) return;

            busy.current = true;

            void enroll(pushed, language, register).catch(() => null ).finally(() => { busy.current = false; });

        };

        attempt();

        const watcher = AppState.addEventListener("change", ( status ) => {

            if ( status === "active" ) attempt();

        });

        return () => watcher.remove();

    }, [ token, language, register ]);

    return null;

}
