import { permissionsOf } from "engine/client";
import { createElement, type ReactNode } from "react";
import Frame from "@/elements/frame";
import Loading from "@/elements/loading";
import { SignalsProvider } from "@/hooks/use-client";
import { useLocale, useTheme } from "@/hooks/use-locale";
import type { Screen as Facing, Route } from "@/lib/spec/feature";
import { type Locale, languages } from "@/lib/spec/languages";
import { shellAt, text } from "@/lib/spec/runtime";
import type { Shell } from "@/lib/spec/surface";
import { palette } from "@/styles/theme";
import { Blocks, type Facts, feature } from "./blocks";
import { Boundary } from "./boundary";
import { Gate } from "./gate";

type Props = { screen: Facing; route: Route };

function part ( name: keyof Shell, screen: Facing, route: Route, locale: Locale ): ReactNode {

    const part = shellAt(screen, name, locale);

    return part ? createElement(feature(part.feature), { options: part.options, ports: {}, screen, route }) : null;

}
export function Screen ({ screen, route }: Props) {

    const locale = useLocale();
    const colors = palette(useTheme());
    const facts: Facts = { screen, route, loader: <Loading palette={colors} />, palette: colors };
    const body = (

        <Boundary
            name={screen.name}
            message={text({ key: "state.failed" }, locale)}
            retry={text({ key: "state.retry" }, locale)}
            palette={colors}
        >

            <SignalsProvider><Blocks blocks={screen.blocks} facts={facts} /></SignalsProvider>

        </Boundary>

    );
    const access = permissionsOf(screen.access);
    const gated = screen.access === "any" ? body
        : <Gate access={access} guest={screen.access === "guest"} redirect={screen.redirect}>{body}</Gate>;

    return (

        <Frame
            palette={colors}
            direction={languages[locale].direction}
            scroll={screen.options.scroll}
            header={part("header", screen, route, locale)}
            tabs={part("tabs", screen, route, locale)}
        >

            {gated}

        </Frame>

    );

}
