import { permissionsOf } from "engine/client";
import { createElement, type ReactNode } from "react";
import Loading from "@/elements/loading";
import Shell from "@/elements/shell";
import { SignalsProvider } from "@/hooks/use-client";
import { useLocale } from "@/hooks/use-locale";
import type { Screen as Facing, Route } from "@/lib/spec/feature";
import type { Locale } from "@/lib/spec/languages";
import { shellAt, text } from "@/lib/spec/runtime";
import type { Shell as ShellParts } from "@/lib/spec/surface";
import { Blocks, type Facts, feature } from "./blocks";
import { Boundary } from "./boundary";
import { Gate } from "./gate";

type Props = { screen: Facing; route: Route };

function part ( name: keyof ShellParts, screen: Facing, route: Route, locale: Locale ): ReactNode {

    const part = shellAt(screen, name, locale);

    return part ? createElement(feature(part.feature), { options: part.options, ports: {}, screen, route }) : null;

}
export function Screen ({ screen, route }: Props) {

    const locale = useLocale();
    const loader = screen.options.loader ? <Loading label={text({ key: "state.loading" }, locale)} /> : null;
    const facts: Facts = { screen, route, loader };
    const body = (

        <Boundary
            name={screen.name}
            message={text({ key: "state.failed" }, locale)}
            retry={text({ key: "state.retry" }, locale)}
        >

            <SignalsProvider><Blocks blocks={screen.blocks} facts={facts} /></SignalsProvider>

        </Boundary>

    );
    const gated = screen.access === "any"
        ? body
        : <Gate access={permissionsOf(screen.access)} guest={screen.access === "guest"} redirect={screen.redirect}>{body}</Gate>;

    return (

        <Shell
            skip={text({ key: "nav.skip" }, locale)}
            page={screen.name}
            scroll={screen.options.scroll}
            nav={part("nav", screen, route, locale)}
            sidebar={part("sidebar", screen, route, locale)}
            footer={part("footer", screen, route, locale)}
        >

            {gated}

        </Shell>

    );

}
