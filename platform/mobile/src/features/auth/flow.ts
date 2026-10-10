import { router } from "expo-router";
import { Keyboard } from "react-native";
import { type AuthOutcome, challenged } from "@/model/auth";
import { usePrefs } from "@/store/prefs";
import { useSession } from "@/store/session";

const landings = { login: "/story", register: "/story" } as const;

export const leave = () => {

    if ( router.canGoBack() ) router.back();
    else router.replace("/gate");

};

type AuthOrigin = keyof typeof landings;

export const originOf = ( value: string | undefined ): AuthOrigin => value === "register" ? "register" : "login";

export async function settle ( result: AuthOutcome, from: AuthOrigin ) {

    if ( challenged(result) ) {

        router.push({
            pathname: "/verify",
            params: {
                challenge: result.challenge_token,
                destination: result.destination,
                length: String(result.length ?? 5),
                retry: result.retry_at ?? "",
                origin: from,
            },
        });

        return;

    }

    Keyboard.dismiss();

    await useSession.getState().open(result.token, result.user, from === "register");

    usePrefs.getState().startStory();

    if ( router.canDismiss() ) router.dismissAll();

    router.replace(landings[from]);

}
