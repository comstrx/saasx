import type { ComponentProps } from "react";
import Emblem from "@/elements/emblem";
import Footer from "@/elements/footer";
import Grid from "@/elements/grid";
import Heading from "@/elements/heading";
import Logo from "@/elements/logo";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";
import ContactLinks from "./contact-links";
import LinkGroup from "./link-group";
import LocalePicker from "./locale-picker";
import SocialLinks from "./social-links";
import ThemeToggle from "./theme-toggle";

type Props = {
    brand: ComponentProps<typeof Logo>;
    description?: string;
    groups: readonly ComponentProps<typeof LinkGroup>[];
    promises: readonly { icon: string; title: string; body: string }[];
    copyright: string;
    compact?: boolean;
    help: { title: string; body: string };
    labels: { promises: string; groups: string };
    contacts?: ComponentProps<typeof ContactLinks>["items"];
    socials?: ComponentProps<typeof SocialLinks>["items"];
};

export default function SiteFooter ({
    brand, description, groups, promises, copyright, compact, help, labels, contacts = [], socials = [],
}: Props) {

    const bottom = (

        <Stack direction="responsive" align="center" justify="between" gap={4}>

            <Stack direction="row" align="center" gap={3}>

                {compact ? <Logo {...brand} /> : null}

                <Text size="small" tone="muted" dir="auto">{copyright}</Text>

            </Stack>

            <Stack direction="row" gap={2} align="center">

                <ThemeToggle />

                <LocalePicker />

            </Stack>

        </Stack>

    );

    if ( compact ) return <Footer bottom={bottom}>{null}</Footer>;

    return (

        <Footer
            bottom={bottom}
            band={contacts.length ? (

                <Stack direction="wide" align="center" justify="between" gap={5}>

                    <Stack direction="row" align="center" gap={4}>

                        <Emblem tone="teal" size="large"><Icon name="headset" /></Emblem>

                        <Stack gap={1}>

                            <Heading level={2} size="title">{help.title}</Heading>

                            <Text size="small" tone="muted">{help.body}</Text>

                        </Stack>

                    </Stack>

                    <ContactLinks items={contacts} />

                </Stack>

            ) : null}
            promises={promises.length ? (

                <Grid columns={4} mobileColumns={1} gap={2} label={labels.promises}>

                    {promises.map(( entry ) => (

                        <Stack as="li" key={entry.title} direction="row" align="start" gap={3} inset="medium">

                            <Emblem tone="neutral" size="small" shape="round">

                                {isIconName(entry.icon) ? <Icon name={entry.icon} /> : null}

                            </Emblem>

                            <Stack gap={0}>

                                <Text size="small" weight="semibold">{entry.title}</Text>

                                <Text size="label" tone="muted">{entry.body}</Text>

                            </Stack>

                        </Stack>

                    ))}

                </Grid>

            ) : null}
        >

            <Stack direction="wide" justify="between" gap={10}>

                <Stack gap={5} width="narrow">

                    <Logo {...brand} />

                    {description ? <Text size="small" tone="muted" measure="short">{description}</Text> : null}

                    <SocialLinks items={socials} />

                </Stack>

                <Stack as="nav" aria-label={labels.groups} direction="responsive" gap={10} wrap>

                    {groups.map(( group ) => <LinkGroup key={group.title} {...group} />)}

                </Stack>

            </Stack>

        </Footer>

    );

}
