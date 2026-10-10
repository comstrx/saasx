"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Credentials from "./components/credentials";
import LinkAction from "./components/link-action";
import Prompt from "./components/prompt";
import Reset from "./components/reset";

export const options = {
    view: "login",
    country: "",
    art: "",
    login: "/login",
    register: "/register",
    recover: "/recover",
    home: "/",
    callback: "/auth/callback",
};

export default function Feature ({ options: chosen, screen, route }: FeatureProps<typeof options>) {

    if ( chosen.view === "prompt" ) return <Prompt title={screen.title} login={chosen.login} register={chosen.register} art={chosen.art} />;

    const token = route.parameters.token ?? (typeof route.query.token === "string" ? route.query.token : "");
    const code = typeof route.query.code === "string" ? route.query.code : "";

    if ( chosen.view === "confirm" || chosen.view === "callback" ) return (

        <LinkAction
            key={token || code} mode={chosen.view} value={chosen.view === "confirm" ? token : code}
            refused={!!route.query.error} art={chosen.art} links={chosen}
        />

    );

    if ( chosen.view === "reset" ) return <Reset key={token} token={token} title={screen.title} art={chosen.art} links={chosen} />;

    return (

        <Credentials
            key={chosen.view} mode={chosen.view === "register" ? "register" : chosen.view === "recover" ? "recover" : "login"}
            title={screen.title} description={screen.description} art={chosen.art}
            country={chosen.country} callback={chosen.callback} links={chosen}
        />

    );

}
