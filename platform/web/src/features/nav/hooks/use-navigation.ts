import { readContent } from "@/api/workflow/server";
import { screenArt } from "@/hooks/use-catalog";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import type { Locale } from "@/lib/spec/languages";
import { config, placements, screens, text } from "@/lib/spec/server";
import { localePath } from "@/lib/std/locale";

export type NavigationOptions = {
    links: readonly string[];
    more: readonly string[];
    account: readonly string[];
    tabs: readonly string[];
    login: string;
    profile: string;
    favorites: string;
    notifications: string;
    preferences: string;
    help: string;
    explore: string;
    search: string;
    cart: string;
    order: string;
    ticket: string;
    wallet: string;
    current: string;
};

type Screen = (typeof screens)[number];

const counted = ["chat", "notifications"] as const;

function within ( here: string, path: string ): boolean {

    return here === path || (path !== "/" && here.startsWith(`${path}/`));

}
export async function navigation ( {
    links, more, account, tabs, login, profile, favorites, notifications, preferences, help, explore, search, cart, order, ticket, wallet,
    current,
}: NavigationOptions ) {

    const [locale, t, content, finder, inbox] = await Promise.all([
        getLocale() as Promise<Locale>, getTranslations("nav"), readContent(), getTranslations("finder"), getTranslations("notifications"),
    ]);
    const here = screens.find(( screen ) => screen.name === current)?.path ?? "";
    const named = ( names: readonly string[] ) => names.flatMap(( name ) => screens.filter(( screen ) => screen.name === name));
    const path = ( screen: Screen ) => localePath(locale, screen.path, routing);
    const entry = ( screen: Screen ) => ({
        href: path(screen),
        label: text(screen.title, locale),
        description: text(screen.description, locale),
        icon: screen.icon ?? null,
        current: within(here, screen.path),
    });
    const find = ( name: string ) => screens.find(( screen ) => screen.name === name);
    const labelOf = ( screen: Screen ) => text(screen.label ?? screen.title, locale);
    const entrance = find(login);
    const own = find(profile);
    const saved = find(favorites);
    const bell = find(notifications);
    const choices = find(preferences);
    const support = find(help);
    const results = find(search);
    const basket = find(cart);
    const pattern = ( name: string, fallback: string ) => find(name)?.path ?? fallback;

    return {
        label: t("label"),
        brand: {
            href: localePath(locale, "/", routing),
            src: content.logo ?? config.content.logo,
            dark: content.logo_dark ?? config.content.logo_dark,
            alt: content.logo_alt || content.name || config.content.name,
            width: content.logo_width ?? config.content.logo_width,
            height: content.logo_height ?? config.content.logo_height,
        },
        links: named(links).map(( screen ) => ({ ...entry(screen), label: labelOf(screen) })),
        menu: {
            label: t("menu"),
            close: t("close"),
            explore: t("explore"),
            pages: named(links).map(( screen ) => ({ ...entry(screen), label: labelOf(screen) })),
            items: named(more).map(entry),
        },
        favorites: saved ? { href: path(saved), label: t("saved"), current: saved.name === current } : null,
        search: {
            search: results?.path ?? null,
            paths: { poi: find("place")?.path ?? null, campaign: find("campaign")?.path ?? null },
            verticals: named(more).map(( screen ) => ({
                href: screen.path, label: labelOf(screen), art: screenArt([screen.name], "discovery"),
            })),
            labels: {
                open: finder("open"), title: finder("title"), placeholder: finder("placeholder"), close: finder("close"),
                clear: finder("clear"),
                recent: finder("recent"), forget: finder("forget"), explore: finder("explore"), places: finder("places"),
                categories: finder("categories"), items: finder("items"), empty: finder("empty"), emptyBody: finder("emptyBody"),
                failed: finder("failed"), navigate: finder("navigate"), choose: finder("choose"), dismiss: finder("dismiss"),
                searchFor: finder("searchFor"), stories: finder("stories"), hosts: finder("hosts"), deals: finder("deals"),
                spots: finder("spots"),
            },
        },
        tabs: {
            label: t("tabs"),
            items: named(tabs).map(( screen ) => ({
                ...entry(screen),
                label: screen.name === profile ? t("profile") : screen.name === explore ? t("explore") : labelOf(screen),
                key: screen.name,
                badge: counted.find(( feature ) => placements(feature).some(( entry ) => entry.screen.name === screen.name)) ?? null,
            })),
        },
        account: {
            signIn: entrance ? path(entrance) : null,
            cart: basket ? { href: path(basket), label: labelOf(basket) } : null,
            bell: bell ? {
                href: path(bell),
                links: {
                    order: pattern(order, "/orders/:orderId"),
                    ticket: pattern(ticket, "/support/:ticketId"),
                    wallet: pattern(wallet, "/wallet"),
                },
                labels: {
                    open: t("notifications"), title: inbox("bellTitle"), readAll: inbox("readAll"), all: inbox("groups.all"),
                    unread: inbox("groups.unread"), viewAll: inbox("viewAll"), empty: inbox("bellEmpty"), emptyBody: inbox("bellEmptyBody"),
                    failed: inbox("unavailable"), retry: inbox("retry"), loading: inbox("loading"), untitled: inbox("untitled"),
                    filter: inbox("tabs"),
                },
            } : null,
            profile: own ? path(own) : null,
            preferences: choices ? path(choices) : null,
            help: support ? { href: path(support), label: labelOf(support) } : null,
            links: named(account).map(( screen ) => ({ ...entry(screen), label: labelOf(screen), key: screen.name })),
            labels: {
                signIn: t("signIn"),
                menu: t("account"),
                signOut: t("signOut"),
                favorites: t("saved"),
                greeting: t("greeting"),
                dark: t("dark"),
                locale: t("locale"),
            },
        },
    };

}
