import type { ReactNode } from "react";
import Art from "@/elements/art";
import Badge from "@/elements/badge";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Masthead from "@/elements/masthead";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";
import TrustRow from "./trust-row";
import VerticalTabs from "./vertical-tabs";

type Item = { href: string; label: string; icon: string | null; current: boolean };
type Props = {
    title: string;
    description?: string;
    art?: string | null;
    heading?: boolean;
    prominent?: boolean;
    badge?: string;
    trust?: readonly string[];
    actions?: readonly { label: string; href: string; icon?: string | null }[];
    verticals?: { label: string; items: readonly Item[] };
    kicker?: ReactNode;
    meta?: ReactNode;
    children?: ReactNode;
};

export default function PageHeader ({
    title, description, art, heading, prominent = false, badge, trust = [], actions = [], verticals, kicker, meta, children,
}: Props) {

    return (

        <Masthead
            tabs={verticals ? <VerticalTabs {...verticals} /> : null}
            stage={art ? (

                <Art src={art} size={prominent ? "hero" : "adaptive"} motion={prominent ? "float" : "still"} glow priority />

            ) : null}
            body={

                <>

                    {kicker}

                    {badge ? (

                        <Stack direction="row">

                            <Badge tone="ivory" size="large"><Icon name="sparkle" weight="fill" />{badge}</Badge>

                        </Stack>

                    ) : null}

                    <Heading level={heading ? 1 : 2} size={prominent ? "display" : "headline"}>{title}</Heading>

                    {description ? <Text size="title" tone="muted" measure="short" wrap="pretty" clamp={3}>{description}</Text> : null}

                    {meta}

                    <TrustRow items={trust} />

                </>

            }
            actions={actions.length ? actions.map(( action ) => (

                <Link key={action.href} href={action.href} variant="subtle" size="large">

                    {isIconName(action.icon) ? <Icon name={action.icon} /> : null}

                    {action.label}

                </Link>

            )) : null}
            dock={children}
        />

    );

}
