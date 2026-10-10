import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Avatar } from "@/elements/avatar";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Divider } from "@/elements/divider";
import { Icon, type IconName } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import type { Host, Voice } from "@/model/detail";
import { formatDate, formatNumber } from "@/std/number";
import { above } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type HostCardProps = {
    host: Host;
    voice: Voice;
    onMessage: () => void;
    onProfile: () => void;
};

export function HostLine ({ host, onPress }: { host: Host; onPress: () => void }) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();

    return (
        <Press onPress={onPress} feel="dim" accessibilityRole="button" accessibilityLabel={host.name} style={styles.line}>
            <Avatar name={host.name} source={host.image ?? undefined} size={theme.control.md.height} />

            <Box gap="1" style={styles.grow}>
                <Text rank="label" numberOfLines={1}>{t("details.hostedBy", { name: host.name })}</Text>
                {host.memberSince ? <Text rank="caption" ink="soft" numberOfLines={1}>{t("details.hostSince", { value: formatDate(i18n.language, host.memberSince, "month") })}</Text> : null}
            </Box>

            {host.verified ? <Icon name="verified" size={theme.icon.md} tint="brand" /> : null}
        </Press>
    );

}

function HostFact ({ icon, text }: { icon: IconName; text: string }) {

    const theme = useTheme();

    return (
        <Box style={styles.fact} row align="center" gap="3">
            <Icon name={icon} size={theme.icon.md} />
            <Text rank="body">{text}</Text>
        </Box>
    );

}

export function HostCard ({ host, voice, onMessage, onProfile }: HostCardProps) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();

    const rated = host.reviews > 0;

    const facts = [
        ...( host.memberSince ? [ { key: "since", icon: "calendar" as IconName, text: t("details.hostSince", { value: formatDate(i18n.language, host.memberSince, "month") }) } ] : [] ),
        ...( host.responseRate > 0 ? [ { key: "rate", icon: "bolt" as IconName, text: t("details.hostResponseRate", { value: host.responseRate }) } ] : [] ),
        ...( host.responseTime ? [ { key: "time", icon: "clock" as IconName, text: t("details.hostResponseTime", { value: host.responseTime }) } ] : [] ),
    ];

    const stats = [
        ...rated
            ? [
                { key: "reviews", value: formatNumber(i18n.language, host.reviews), label: t("details.hostReviews", { count: host.reviews }) },
                { key: "rating", value: host.rating.toFixed(1), label: t("details.rating") },
            ]
            : [ { key: "fresh", value: t("details.fresh"), label: t("details.freshNote") } ],
        { key: "listings", value: formatNumber(i18n.language, host.catalogs), label: t("details.hostListings") },
    ];

    return (
        <Box gap="5">
            <Press onPress={onProfile} feel="dim" accessibilityRole="button" accessibilityLabel={host.name} style={styles.card}>
                <Box style={styles.faceBlock} align="center" gap="1">
                    <Box style={styles.face}>
                        <Avatar name={host.name} source={host.image ?? undefined} size={theme.art.md} />
                        {host.verified ? (
                            <Box style={styles.verified} align="center" justify="center">
                                <Icon name="check" size={theme.icon.sm} tint="lit" weight="bold" />
                            </Box>
                        ) : null}
                    </Box>

                    <Text rank="display" numberOfLines={1}>{host.name}</Text>
                    <Text rank="caption" ink="soft">{host.verified ? t("details.verifiedHost") : t("details.hostLabel")}</Text>
                </Box>

                <Box style={styles.stats}>
                    {stats.map(( stat, index ) => (
                        <Box key={stat.key}>
                            {index > 0 ? <Divider /> : null}
                            <Box style={styles.stat} gap="0">
                                <Text rank="title">{stat.value}</Text>
                                <Text rank="note" ink="soft">{stat.label}</Text>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Press>

            {facts.length > 0 ? (
                <Box gap="1">
                    {facts.map(( fact ) => <HostFact key={fact.key} icon={fact.icon} text={fact.text} />)}
                </Box>
            ) : null}

            <Button label={t(`details.voice.${ voice }.messageHost`)} kind="soft" tint="neutral" onPress={onMessage} />
        </Box>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    card: {
        minHeight: theme.art.xl,
        flexDirection: "row",
        alignItems: "center",
        padding: theme.space["5"],
        borderRadius: theme.radius.card,
        backgroundColor: theme.plane[above("base", theme.name === "dark")],
    },
    fact: {
        minHeight: theme.control.sm.height,
    },
    line: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["4"],
    },
    grow: {
        flex: 1,
        minWidth: 0,
    },
    faceBlock: {
        flex: 1.35,
    },
    face: {
        position: "relative",
    },
    verified: {
        position: "absolute",
        insetInlineStart: -2,
        bottom: 0,
        width: theme.composition.crest.badge - theme.space["1"],
        height: theme.composition.crest.badge - theme.space["1"],
        borderRadius: theme.radius.pill,
        borderWidth: theme.stroke.base,
        borderColor: theme.plane[above("base", theme.name === "dark")],
        backgroundColor: theme.tone.brand.bright,
    },
    stats: {
        flex: 1,
        alignSelf: "stretch",
        justifyContent: "center",
    },
    stat: {
        paddingVertical: theme.space["2"],
    },

}));
