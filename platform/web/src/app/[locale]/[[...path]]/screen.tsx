import "server-only";

import { createElement, type ReactNode } from "react";
import Shell from "@/elements/shell.tsx";
import { getTranslations } from "@/lib/providers/intl-server";
import type { Screen as Facing, Route } from "@/lib/spec/feature";
import type { Shell as ShellParts } from "@/lib/spec/screens";
import { config, shell } from "@/lib/spec/server";
import { Blocks, type Facts, feature } from "./blocks";
import { ClientOnly } from "./client-only";

type Props = { screen: Facing; route: Route };

const parts = ["nav", "sidebar", "footer", "loader"] as const;

async function part ( name: keyof ShellParts, screen: Facing, route: Route ): Promise<ReactNode> {

    const chosen = config.settings.shell[name];

    if ( !chosen || !screen.options[name] ) return null;

    return createElement(await feature(chosen), { options: shell[name], screen, route });

}
export async function Screen ({ screen, route }: Props) {

    const [nav, sidebar, footer, loader] = await Promise.all(parts.map(( name ) => part(name, screen, route)));
    const t = await getTranslations("nav");
    const facts: Facts = { screen, route, loader };
    const blocks = <Blocks blocks={screen.blocks} facts={facts} />;

    return (

        <Shell skip={t("skip")} page={screen.name} nav={nav} sidebar={sidebar} footer={footer}>

            {screen.options.render === "client" ? <ClientOnly>{blocks}</ClientOnly> : blocks}

        </Shell>

    );

}
