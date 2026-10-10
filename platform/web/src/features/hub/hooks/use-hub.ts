import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import type { Locale } from "@/lib/spec/languages";
import { screens, text } from "@/lib/spec/server";
import { localePath } from "@/lib/std/locale";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
export type HubOptions = {
    title: string;
    sections: readonly { screen: string; tone: Tone }[];
    personal: string; security: string; wallet: string; orders: string; notifications: string; rewards: string; login: string; art: string;
};

export async function hub ( options: HubOptions ) {

    const [locale, t] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("hub")]);
    const find = ( name: string ) => screens.find(( screen ) => screen.name === name);
    const href = ( name: string ) => {

        const screen = find(name);

        return screen ? localePath(locale, screen.path, routing) : null;

    };

    return {
        title: options.title,
        art: options.art,
        login: href(options.login),
        links: {
            personal: href(options.personal), security: href(options.security), wallet: href(options.wallet),
            orders: href(options.orders), notifications: href(options.notifications), rewards: href(options.rewards),
        },
        sections: options.sections.flatMap(( section ) => {

            const screen = find(section.screen);

            return screen ? [{
                key: screen.name,
                href: localePath(locale, screen.path, routing),
                title: text(screen.label ?? screen.title, locale),
                description: text(screen.description, locale),
                icon: screen.icon ?? "dots",
                tone: section.tone,
            }] : [];

        }),
        labels: {
            greeting: {
                morning: t("greeting.morning", { name: "{name}" }),
                afternoon: t("greeting.afternoon", { name: "{name}" }),
                evening: t("greeting.evening", { name: "{name}" }),
            },
            profile: t("profile"), memberSince: t("memberSince", { date: "{date}" }), level: t("level"), edit: t("edit"),
            health: t("health"), healthBody: t("healthBody"), done: t("done"),
            complete: t("complete", { done: "{done}", total: "{total}" }),
            steps: {
                email: t("steps.email"), phone: t("steps.phone"), photo: t("steps.photo"), password: t("steps.password"),
                address: t("steps.address"),
            },
            snapshot: t("snapshot"), balance: t("balance"), bookings: t("bookings"), unread: t("unread"), points: t("points"),
            manage: t("manage"), manageBody: t("manageBody"), attention: t("attention"),
            loyalty: t("loyalty"), loyaltyBody: t("loyaltyBody"), next: t("next"), perks: t("perks"),
            signInTitle: t("signInTitle"), signInBody: t("signInBody"), signIn: t("signIn"), failed: t("failed"), retry: t("retry"),
            loading: t("loading"),
        },
    };

}
