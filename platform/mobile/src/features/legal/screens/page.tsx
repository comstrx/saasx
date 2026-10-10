import { type Href, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Section } from "@/components/section";
import { Loading } from "@/components/states";
import { AppBar } from "@/elements/app-bar";
import type { EmblemName } from "@/elements/emblem";
import { Empty } from "@/elements/empty";
import { usePull } from "@/elements/hooks/use-pull";
import { Stagger } from "@/elements/motion";
import { Press } from "@/elements/press";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Text } from "@/elements/text";
import { HelpDoors, HelpRows } from "@/features/legal/components/help";
import { Trouble } from "@/features/shell";
import { LegalRows } from "@/features/shell/components/legal-rows";
import { retreat } from "@/features/shell/retreat";
import { type Clause, clausesOf } from "@/model/content";
import { useContentPage } from "@/query/content";
import { useSession } from "@/store/session";
import { useTheme } from "@/theme/use-theme";

type Face = {
    emblem: EmblemName;
    route?: Href | undefined;
    member?: boolean | undefined;
};

const faces: Partial<Record<string, Face>> = {
    about: { emblem: "suitcase", route: "/explore" },
    privacy: { emblem: "lock", route: "/personal", member: true },
    terms: { emblem: "file" },
};

type LegalScreenProps = {
    page: string;
};

export function LegalScreen ({ page }: LegalScreenProps) {

    const { t } = useTranslation();
    const theme = useTheme();
    const token = useSession(( state ) => state.token );

    const blocks = useContentPage(page);
    const pull = usePull(blocks.refetch);

    const rows = blocks.data ?? [];
    const title = t(`legal.${ page }`, t("legal.title"));
    const face = faces[page];
    const route = face?.route && ( !face.member || token ) ? face.route : undefined;

    const clauses = rows.flatMap(( block ): Clause[] => {

        const parts = clausesOf(block.body).map(( part ) => ({ ...part, key: `${ block.id }-${ part.key }` }) );
        const named = block.title && block.title !== title && parts.every(( part ) => !part.lead );

        return named ? [ { key: String(block.id), lead: block.title, text: parts.map(( part ) => part.text ).join("\n\n") } ] : parts;

    });

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={title} onBack={retreat} />

            {blocks.isPending ? <View style={styles.inset}><Loading shape="rows" /></View> : null}

            {blocks.isError && !blocks.data ? <Trouble reason={blocks.error} onRetry={blocks.refetch} /> : null}

            {blocks.data ? (
                <Scroll contentContainerStyle={styles.body} refreshing={pull.refreshing} onRefresh={pull.onRefresh}>
                    <Stagger>
                        <View style={styles.article}>
                            <Text rank="hero" accessibilityRole="header">{t(`legal.hero.${ page }.title`, title)}</Text>
                            <Text rank="caption" ink="soft">{t("legal.byline")}</Text>

                            <View style={styles.quote}>
                                <Text rank="body">{rows[0]?.note || t(`legal.hero.${ page }.body`, t("legal.aboutBody"))}</Text>

                                {route ? (
                                    <Press onPress={() => router.push(route) } feel="dim" accessibilityRole="link" style={styles.link}>
                                        <Text rank="body" color={theme.tone.brand.onSoft}>{t(`legal.hero.${ page }.action`)}</Text>
                                    </Press>
                                ) : null}
                            </View>
                        </View>

                        {clauses.length === 0 ? <Empty emblem={face?.emblem ?? "file"} title={t("legal.emptyTitle")} note={t("legal.emptyBody")} /> : null}

                        {clauses.length > 0 ? (
                            <View style={styles.article}>
                                {clauses.map(( clause ) => (
                                    <View key={clause.key} style={styles.clause}>
                                        {clause.lead ? <Text rank="section" accessibilityRole="header">{clause.lead}</Text> : null}
                                        <Text rank="body">{clause.text}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : null}
                    </Stagger>

                    <Stagger delay={2 * theme.beat.stagger}>
                        <Section title={t("services.help")}>
                            <HelpDoors />
                            <HelpRows />
                            <LegalRows except={page} />
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
    body: {
        gap: theme.layout.section,
        paddingHorizontal: theme.layout.gutter,
        paddingTop: theme.space["2"],
    },
    article: {
        gap: theme.space["4"],
        paddingHorizontal: theme.space["1"],
    },
    quote: {
        gap: theme.space["2"],
        marginTop: theme.space["2"],
        paddingStart: theme.space["3"],
        borderStartWidth: theme.stroke.rail,
        borderStartColor: theme.tone.brand.onSoft,
    },
    link: {
        alignSelf: "flex-start",
    },
    clause: {
        gap: theme.space["2"],
    },

}));
