import { permissionsOf } from "engine/client";
import "server-only";

import type { ReactNode } from "react";
import Shell from "@/elements/shell";
import { SignalsProvider } from "@/hooks/use-client";
import { requestLocale } from "@/lib/site/request";
import type { Screen as Facing, Route } from "@/lib/spec/feature";
import type { Locale } from "@/lib/spec/languages";
import { shellAt, text } from "@/lib/spec/server";
import type { Shell as ShellParts } from "@/lib/spec/surface";
import { Blocks, type Facts, placed } from "./blocks";
import { Boundary } from "./boundary";
import { ClientOnly } from "./client-only";
import { Gate } from "./gate";
import { Preload } from "./mount";

type Props = { screen: Facing; route: Route };

const parts = ["nav", "sidebar", "footer", "loader"] as const;

async function part ( name: keyof ShellParts, screen: Facing, route: Route ): Promise<ReactNode> {

    const part = shellAt(screen, name, await requestLocale() as Locale);

    return part ? placed(part.feature, { options: part.options, ports: {}, screen, route }) : null;

}
export async function Screen ({ screen, route }: Props) {

    const [nav, sidebar, footer, loader] = await Promise.all(parts.map(( name ) => part(name, screen, route)));
    const locale = await requestLocale() as Locale;
    const facts: Facts = { screen, route, loader };
    const blocks = (

        <Boundary
            name={screen.name}
            message={text({ key: "state.failed" }, locale)}
            retry={text({ key: "state.retry" }, locale)}
        >

            <SignalsProvider><Blocks blocks={screen.blocks} facts={facts} /></SignalsProvider>

        </Boundary>

    );
    const body = screen.options.render === "client" && screen.access !== "guest" ? <ClientOnly fallback={loader}>{blocks}</ClientOnly>
        : blocks;
    const gated = screen.access === "any"
        ? body
        : <Gate
            access={permissionsOf(screen.access)}
            guest={screen.access === "guest"}
            redirect={screen.redirect}
        >
            {body}
        </Gate>

    return (

        <Shell skip={text({ key: "nav.skip" }, locale)} page={screen.name} nav={nav} sidebar={sidebar} footer={footer}>

            {gated}

            <Preload />

        </Shell>

    );

}
