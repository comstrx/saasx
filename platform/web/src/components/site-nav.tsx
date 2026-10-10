import type { ComponentProps } from "react";
import Logo from "@/elements/logo";
import Navbar from "@/elements/navbar";
import Pebble from "@/elements/pebble";
import Stack from "@/elements/stack";
import Icon from "@/icons/icon";
import AccountTools from "./account-tools";
import GlobalSearch from "./global-search";
import LocalePicker from "./locale-picker";
import MobileMenu from "./mobile-menu";
import NavTabs from "./nav-tabs";
import NavigationLinks from "./navigation-links";
import ThemeToggle from "./theme-toggle";

type Item = { href: string; label: string; description?: string; icon: string | null; current: boolean };
type Props = {
    label: string;
    brand: ComponentProps<typeof Logo>;
    links: readonly Item[];
    menu: ComponentProps<typeof MobileMenu>;
    tabs: ComponentProps<typeof NavTabs>;
    favorites: { href: string; label: string; current: boolean } | null;
    search: ComponentProps<typeof GlobalSearch>;
    account: ComponentProps<typeof AccountTools>;
};

export default function SiteNav ({ label, brand, links, menu, tabs, favorites, search, account }: Props) {

    return (

        <>

            <Navbar
                label={label}
                brand={<Logo {...brand} />}
                links={<NavigationLinks items={links} />}
                actions={

                    <>

                        <GlobalSearch {...search} />

                        <Stack direction="row" gap={2} visibility="tablet" fixed>

                            <LocalePicker />

                            <ThemeToggle />

                            {favorites ? (

                                <Pebble label={favorites.label} href={favorites.href}>

                                    <Icon name="heart" weight={favorites.current ? "fill" : "regular"} />

                                </Pebble>

                            ) : null}

                        </Stack>

                        <AccountTools {...account} />

                    </>

                }
                mobile={<MobileMenu {...menu} />}
            />

            <NavTabs {...tabs} />

        </>

    );

}
