"use client";

import Amount from "@/elements/amount";
import Art from "@/elements/art";
import Chip from "@/elements/chip";
import Columns from "@/elements/columns";
import Emblem from "@/elements/emblem";
import Grid from "@/elements/grid";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Loader from "@/elements/loader";
import Portrait from "@/elements/portrait";
import Progress from "@/elements/progress";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import { useAccountHub } from "@/hooks/use-account-hub";
import Icon from "@/icons/icon";
import FormRetry from "./form-retry";
import PageHead from "./page-head";
import Section from "./section";
import SectionTile from "./section-tile";
import SignInPrompt from "./sign-in-prompt";
import StatTile from "./stat-tile";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Props = {
    title: string;
    art: string;
    login: string | null;
    links: {
        personal: string | null; security: string | null; wallet: string | null; orders: string | null; notifications: string | null;
        rewards: string | null;
    };
    sections: readonly { key: string; href: string; title: string; description: string; icon: string; tone: Tone }[];
    labels: {
        greeting: { morning: string; afternoon: string; evening: string };
        profile: string; memberSince: string; level: string; edit: string;
        health: string; healthBody: string; complete: string; done: string;
        steps: { email: string; phone: string; photo: string; password: string; address: string };
        snapshot: string; balance: string; bookings: string; unread: string; points: string;
        manage: string; manageBody: string; attention: string; loyalty: string; loyaltyBody: string; next: string; perks: string;
        signInTitle: string; signInBody: string; signIn: string; failed: string; retry: string; loading: string;
    };
};

export default function AccountHub ({ title, art, login, links, sections, labels }: Props) {

    const hub = useAccountHub({ personal: links.personal, security: links.security });

    if ( !hub.ready ) return <Loader label={labels.loading} layout="section" />;

    if ( !hub.signed ) return login ? (

        <SignInPrompt level={1} title={labels.signInTitle} description={labels.signInBody} href={login} label={labels.signIn} art={art} />

    ) : null;

    const user = hub.user;
    const remaining = hub.steps.filter(( step ) => !step.done);

    return (

        <Stack gap={8}>

            <PageHead
                level={1}
                icon="gauge"
                tone="teal"
                title={user ? labels.greeting[hub.moment].replace("{name}", user.first) : title}
                description={hub.today}
            />

            {hub.failed ? <FormRetry id="hub-failure" message={labels.failed} label={labels.retry} onRetry={hub.reload} /> : null}

            {hub.loading ? <Loader label={labels.loading} layout="section" /> : null}

            {user ? (

                <Columns
                    ratio="1:2"
                    gap={6}
                    align="stretch"
                    start={(

                        <Surface padding={6} radius="xl" fill>

                            <Stack gap={4} align="center" justify="center" fill>

                                <Portrait size="xlarge" src={user.image} alt={user.name} initials={user.initials} />

                                <Stack gap={0} align="center">

                                    <Heading level={2} size="h3" align="center">{user.name}</Heading>

                                    {user.contact ? <Text size="small" tone="muted" dir="ltr">{user.contact}</Text> : null}

                                </Stack>

                                {hub.level ? (

                                    <Status tone="brand" icon={<Icon name="crown" size="sm" weight="fill" />}>

                                        {labels.level}: {hub.level.name}

                                    </Status>

                                ) : null}

                                {links.personal ? (

                                    <Link href={links.personal} variant="outlined" size="small" shape="pill">

                                        <Icon name="edit" />{labels.edit}

                                    </Link>

                                ) : null}

                            </Stack>

                        </Surface>

                    )}
                    end={(

                        <Surface padding={6} radius="xl" fill>

                            <Stack gap={5}>

                                <Stack direction="row" align="center" gap={3}>

                                    <Emblem tone="amber" size="medium"><Icon name="shield" /></Emblem>

                                    <Stack gap={0} grow>

                                        <Heading level={2} size="title">{labels.health}</Heading>

                                        <Text size="small" tone="muted">{labels.healthBody}</Text>

                                    </Stack>

                                </Stack>

                                <Stack gap={2}>

                                    <Stack direction="row" align="center" justify="between" gap={3}>

                                        <Text size="small" weight="semibold">{hub.summary(labels.complete)}</Text>

                                        <Text size="label" tone="muted" numeric>{hub.progress}%</Text>

                                    </Stack>

                                    <Progress value={hub.progress} label={labels.health} size="thick" />

                                </Stack>

                                {remaining.length ? (

                                    <Stack direction="row" gap={2} wrap>

                                        {remaining.map(( step ) => step.href ? (

                                            <Chip key={step.key} href={step.href}><Icon name="plus" />{labels.steps[step.key]}</Chip>

                                        ) : null)}

                                    </Stack>

                                ) : (

                                    <Stack direction="row" align="center" gap={2}>

                                        <Icon name="check-circle" size="md" weight="fill" tone="success" />

                                        <Text size="small" weight="medium">{labels.done}</Text>

                                    </Stack>

                                )}

                            </Stack>

                        </Surface>

                    )}
                />

            ) : null}

            {user ? (

                <Section title={labels.snapshot}>

                    <Grid as="ul" columns={4} mobileColumns={1} gap={4} label={labels.snapshot}>

                        <StatTile
                            label={labels.balance}
                            icon="wallet"
                            tone="blue"
                            href={links.wallet}
                            value={hub.snapshot.balance ? (

                                <Amount {...hub.snapshot.balance} currencyLabel={hub.snapshot.balance.currency} size="title" />

                            ) : null}
                        />

                        <StatTile label={labels.bookings} icon="receipt" tone="teal" href={links.orders} value={hub.snapshot.bookings} />

                        <StatTile label={labels.unread} icon="bell" tone="amber" href={links.notifications} value={hub.snapshot.unread} />

                        <StatTile label={labels.points} icon="coins" tone="ember" href={links.rewards} value={hub.snapshot.points} />

                    </Grid>

                </Section>

            ) : null}

            <Section title={labels.manage} description={labels.manageBody}>

                <Grid as="ul" columns={3} mobileColumns={1} gap={4} label={labels.manage}>

                    {sections.map(( { key, ...section } ) => (

                        <SectionTile
                            key={key}
                            {...section}
                            status={section.href === links.personal && user?.attention ? labels.attention : null}
                        />

                    ))}

                </Grid>

            </Section>

            {hub.level ? (

                <Surface padding={8} radius="xl">

                    <Stack direction="responsive" align="center" gap={6}>

                        {hub.level.image ? <Art src={hub.level.image} size="medium" /> : <Art src={art} size="medium" glow />}

                        <Stack gap={3} grow>

                            <Stack gap={1}>

                                <Heading level={2} size="h3">{labels.loyalty}: {hub.level.name}</Heading>

                                <Text size="small" tone="muted">{labels.loyaltyBody}</Text>

                            </Stack>

                            {hub.level.reached !== null ? <Progress value={hub.level.reached} label={labels.next} size="thick" /> : null}

                        </Stack>

                        {links.rewards ? (

                            <Link href={links.rewards} variant="filled" size="medium" shape="pill">

                                {labels.perks}<Icon name="caret-end" />

                            </Link>

                        ) : null}

                    </Stack>

                </Surface>

            ) : null}

        </Stack>

    );

}
