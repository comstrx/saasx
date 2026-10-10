"use client";

import type { ComponentProps } from "react";
import Amount from "@/elements/amount";
import Counter from "@/elements/counter";
import Currency from "@/elements/currency";
import Link from "@/elements/link";
import Menu from "@/elements/menu";
import Pebble from "@/elements/pebble";
import Portrait from "@/elements/portrait";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useAccountTools } from "@/hooks/use-account-tools";
import Icon, { isIconName } from "@/icons/icon";
import NotificationBell from "./notification-bell";

type Props = {
    signIn: string | null;
    cart: { href: string; label: string } | null;
    bell: ComponentProps<typeof NotificationBell> | null;
    profile: string | null;
    preferences: string | null;
    help: { href: string; label: string } | null;
    links: readonly { key: string; href: string; label: string; icon: string | null; current?: boolean }[];
    labels: {
        signIn: string; menu: string; signOut: string; favorites: string; greeting: string;
        dark: string; locale: string;
    };
};

export default function AccountTools ({ signIn, cart, bell, preferences, help, links, labels }: Props) {

    const account = useAccountTools(signIn, Boolean(cart));

    if ( !account.ready ) return null;

    if ( !account.user ) return account.signIn ? (

        <Link href={account.signIn} variant="filled" size="medium" shape="pill" compact aria-label={labels.signIn}>

            <Icon name="user-circle" />

            <Stack as="div" direction="row" visibility="desktop">{labels.signIn}</Stack>

        </Link>

    ) : null;

    return (

        <Stack direction="row" gap={2} align="center" fixed>

            {cart ? (

                <Pebble label={cart.label} href={cart.href} count={account.basket} visibility="wide"><Icon name="bag" /></Pebble>

            ) : null}

            {bell ? <NotificationBell {...bell} /> : null}

            <Menu
                label={`${labels.menu}: ${account.name}`}
                look="avatar"
                width="large"
                onOpenChange={account.setOpen}
                trigger={<Portrait size="tool" src={account.image} alt={account.name} initials={account.initials} />}
                header={

                    <>

                        <Portrait size="small" src={account.image} alt="" initials={account.initials} />

                        <Stack gap={0}>

                            <Text as="span" size="value" weight="semibold" truncate dir="auto">{account.name}</Text>

                            {account.contact ? <Text as="span" size="label" tone="muted" truncate dir="ltr">{account.contact}</Text> : null}

                        </Stack>

                    </>

                }
                sections={[
                    {
                        key: "places",
                        items: links.map(( link ) => {

                            const meta = account.meta[link.key];

                            return {
                                key: link.key,
                                href: link.href,
                                label: link.label,
                                current: link.current,
                                icon: isIconName(link.icon) ? <Icon name={link.icon} weight={link.current ? "fill" : "regular"} /> : null,
                                meta: meta?.count ? <Counter value={meta.count} tone="teal" /> : meta?.amount ? (

                                    <Amount {...meta.amount} currencyLabel={meta.amount.currency} size="micro" tone="inherit" />

                                ) : null,
                            };

                        }),
                    },
                    {
                        key: "preferences",
                        items: [
                            ...(account.theme.available ? [{
                                key: "dark", label: labels.dark, icon: <Icon name="moon" />,
                                checked: account.theme.dark, onSelect: account.theme.toggle,
                            }] : []),
                            ...(preferences ? [{
                                key: "locale", href: preferences, label: labels.locale, icon: <Icon name="globe" />,
                                meta: (

                                    <Stack as="div" direction="row" align="center" gap={1}>

                                        {account.locale.language}

                                        <Text as="span" size="label" tone="muted">·</Text>

                                        <Currency code={account.locale.currency} glyph={account.locale.glyph} />

                                    </Stack>

                                ),
                            }] : []),
                            ...(help ? [{ key: "help", href: help.href, label: help.label, icon: <Icon name="question" /> }] : []),
                        ],
                    },
                    {
                        key: "session",
                        items: [{
                            key: "leave", label: labels.signOut, icon: <Icon name="sign-out" />, onSelect: () => { void account.leave(); },
                        }],
                    },
                ]}
            />

        </Stack>

    );

}
