import { permissionsOf } from "engine/client";
import "server-only";

import type { ReactNode } from "react";
import Shell from "@/elements/shell";
import type { Screen as Facing, Route } from "@/lib/spec/feature";
import type { Locale } from "@/lib/spec/languages";
import { shellAt, text } from "@/lib/spec/server";
import type { Shell as ShellParts } from "@/lib/spec/surface";
import { Blocks, type Facts, placed } from "./blocks";
import { Boundary } from "./boundary";
import { ClientOnly } from "./client-only";
import { Gate } from "./gate";
import { Preload } from "./mount";
import { Signals } from "./signals";

type Props = { screen: Facing; locale: Locale; route: Route };

const parts = ["nav", "sidebar", "footer", "loader"] as const;

async function part ( name: keyof ShellParts, screen: Facing, locale: Locale, route: Route ): Promise<ReactNode> {

    const part = shellAt(screen, name, locale);

    return part ? placed(part.feature, { options: part.options, ports: {}, screen, route }) : null;

}
export async function Screen ({ screen, locale, route }: Props) {

    const [nav, sidebar, footer, loader] = await Promise.all(parts.map(( name ) => part(name, screen, locale, route)));
    const facts: Facts = { screen, route, loader };
    const blocks = (

        <Boundary
            name={screen.name}
            message={text({ key: "state.failed" }, locale)}
            retry={text({ key: "state.retry" }, locale)}
        >

            <Signals><Blocks blocks={screen.blocks} facts={facts} /></Signals>

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
