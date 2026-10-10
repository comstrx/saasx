"use client";

import Divider from "@/elements/divider";
import Emblem from "@/elements/emblem";
import Grid from "@/elements/grid";
import Heading from "@/elements/heading";
import Pebble from "@/elements/pebble";
import Sheet from "@/elements/sheet";
import Stack from "@/elements/stack";
import Tile from "@/elements/tile";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import Icon, { isIconName } from "@/icons/icon";
import LocalePicker from "./locale-picker";
import ThemeToggle from "./theme-toggle";

type Item = { href: string; label: string; description?: string; icon: string | null; current: boolean };
type Props = { label: string; close: string; explore: string; pages: readonly Item[]; items: readonly Item[] };

export default function MobileMenu ({ label, close, explore, pages, items }: Props) {

    const menu = useMobileMenu();

    return (

        <>

            <Pebble label={label} tooltip={false} shape="round" onClick={menu.show}>

                <Icon name="list" />

            </Pebble>

            <Sheet open={menu.open} onOpenChange={menu.setOpen} title={label} close={close}>

                <Stack gap={6}>

                    {pages.length ? (

                        <Grid columns={2} mobileColumns={2} gap={2} label={label}>

                            {pages.map(( page ) => (

                                <Tile key={page.href} href={page.href} title={page.label} active={page.current} size="small" look="panel" />

                            ))}

                        </Grid>

                    ) : null}

                    <Stack gap={3}>

                        <Heading level={2} size="label" tone="muted">{explore}</Heading>

                        <Grid columns={2} mobileColumns={2} gap={2} label={explore}>

                            {items.map(( item ) => (

                                <Tile
                                    key={item.href}
                                    href={item.href}
                                    title={item.label}
                                    active={item.current}
                                    size="small"
                                    icon={<Emblem size="small">{isIconName(item.icon) ? <Icon name={item.icon} /> : null}</Emblem>}
                                />

                            ))}

                        </Grid>

                    </Stack>

                    <Divider />

                    <Stack direction="row" gap={3} align="center">

                        <ThemeToggle />

                        <LocalePicker />

                    </Stack>

                </Stack>

            </Sheet>

        </>

    );

}
