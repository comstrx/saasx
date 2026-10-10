import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Linking, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Group } from "@/components/group";
import { Section } from "@/components/section";
import { ServiceBanner } from "@/components/service-banner";
import { Loading } from "@/components/states";
import { AppBar } from "@/elements/app-bar";
import { Emblem, type EmblemName } from "@/elements/emblem";
import { Empty } from "@/elements/empty";
import { usePull } from "@/elements/hooks/use-pull";
import type { IconName } from "@/elements/icon";
import { Stagger } from "@/elements/motion";
import { Row } from "@/elements/row";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { HelpRows } from "@/features/legal/components/help";
import { Trouble } from "@/features/shell";
import { LegalRows } from "@/features/shell/components/legal-rows";
import { retreat } from "@/features/shell/retreat";
import { emptySiteInfo, reachable, type SiteLink } from "@/model/content";
import { useSiteInfo } from "@/query/content";
import { isolateLtr } from "@/std/bidi";
import { useSession } from "@/store/session";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

const glyphs: Record<string, IconName> = {
    whatsapp: "chat",
    telegram: "send",
    instagram: "camera",
    facebook: "users",
    x: "share",
    twitter: "share",
    youtube: "play",
    tiktok: "play",
    linkedin: "users",
};

const figures: Partial<Record<string, EmblemName>> = {
    whatsapp: "chat",
    telegram: "chat",
};

const tones: Record<string, ToneName> = {
    whatsapp: "success",
    telegram: "info",
    instagram: "accent",
    facebook: "info",
    x: "neutral",
    twitter: "info",
    youtube: "danger",
    tiktok: "neutral",
    linkedin: "info",
};

const dial = ( phone: string ) => `tel:${ phone.replace(/[^\d+]/g, "") }`;

const wire = ( link: SiteLink ): string =>
    link.value.startsWith("http") ? link.value
        : link.key === "whatsapp" ? `https://wa.me/${ link.value.replace(/[^\d]/g, "") }`
        : link.value;

export function ContactScreen () {

    const { t } = useTranslation();

    const info = useSiteInfo();
    const pull = usePull(info.refetch);
    const theme = useTheme();

    const token = useSession(( state ) => state.token );
    const site = info.data ?? emptySiteInfo;
    const open = ( url: string ) => { void Linking.openURL(url); };

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("contact.title")} onBack={retreat} />

            {info.isPending ? <View style={styles.inset}><Loading shape="rows" /></View> : null}

            {info.isError && !info.data ? <Trouble reason={info.error} onRetry={info.refetch} /> : null}

            {info.data ? (
                <Scroll contentContainerStyle={styles.scroll} refreshing={pull.refreshing} onRefresh={pull.onRefresh}>
                    <Stagger>
                        <ServiceBanner
                            title={t("services.contactTitle")}
                            body={t("services.contactBody")}
                            emblem="support"
                            action={token ? t("contact.desk") : undefined}
                            onAction={() => router.push({ pathname: "/chat", params: { desk: String(Date.now()) } }) }
                        />
                        {!reachable(site) ? (
                            <Empty emblem="mail" title={t("contact.emptyTitle")} note={t("contact.emptyBody")} />
                        ) : null}

                        {site.email || site.phone || site.contacts.length > 0 ? (
                            <Section title={t("services.contactWays")}><Group>
                                {site.email ? <Row key="email" figure={<Emblem name="mail" size={theme.composition.service.rowArt} />} title={t("contact.email")} note={isolateLtr(site.email)} onPress={() => open(`mailto:${ site.email }`) } /> : null}
                                {site.phone ? <Row key="phone" figure={<Emblem name="phone" size={theme.composition.service.rowArt} />} title={t("contact.phone")} note={isolateLtr(site.phone)} onPress={() => open(dial(site.phone)) } /> : null}
                                {site.contacts.map(( link ) => (
                                    <Row key={link.key} figure={<Emblem name={figures[link.key] ?? "chat"} size={theme.composition.service.rowArt} />} title={t(`contact.channel.${ link.key }`, link.key)} note={isolateLtr(link.value)} onPress={() => open(wire(link)) } />
                                ))}
                            </Group></Section>
                        ) : null}

                        {site.socials.length > 0 ? (
                            <Section title={t("services.socials")}><Group>
                                {site.socials.map(( link ) => (
                                    <Row key={link.key} plated tone={tones[link.key] ?? "brand"} icon={glyphs[link.key] ?? "share"} title={t(`contact.channel.${ link.key }`, link.key)} onPress={() => open(wire(link)) } />
                                ))}
                            </Group></Section>
                        ) : null}

                        <Section title={t("services.help")}>
                            <HelpRows />
                            <LegalRows />
                        </Section>
                    </Stagger>
                </Scroll>
            ) : null}
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    inset: {
        paddingHorizontal: theme.layout.gutter,
    },
    scroll: {
        gap: theme.layout.section,
        paddingHorizontal: theme.layout.gutter,
        paddingTop: theme.space["2"],
    },

}));
