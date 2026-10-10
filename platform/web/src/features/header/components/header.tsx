import type { ReactNode } from "react";
import PageHeader from "@/components/page-header";
import type { Screen } from "@/lib/spec/feature";
import { headerActions, headerTrust, headerVerticals } from "../hooks/use-header";

type Props = {
    art: string | null;
    headline: string;
    actions: readonly { label: string; path: string; icon: string | null }[];
    perks: readonly string[];
    prominent: boolean;
    verticals: boolean;
    trust: boolean;
    screen: Screen;
    heading: boolean;
    children?: ReactNode;
};

export default async function Header ({ art, headline, actions, perks, prominent, verticals, trust, screen, heading, children }: Props) {

    const [links, strip, assurance] = await Promise.all([
        headerActions(actions),
        verticals ? headerVerticals(screen.name) : undefined,
        trust && !perks.length ? headerTrust() : undefined,
    ]);

    return (

        <PageHeader
            title={headline || screen.title}
            description={screen.description}
            art={art ? `/assets/images/brand/${art}.webp` : null}
            heading={heading}
            prominent={prominent}
            badge={prominent ? assurance?.badge : undefined}
            trust={perks.length ? perks : assurance?.trust}
            actions={links}
            verticals={strip}
        >

            {children}

        </PageHeader>

    );

}
