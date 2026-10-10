import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Divider } from "@/elements/divider";
import { chevronNext, Icon, type IconName } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { type Detail, policyOf, sellable, staying, type Trait, type Voice, voiceOf } from "@/model/detail";
import { useTheme } from "@/theme/use-theme";

export type PolicyPanel = "cancellation" | "rules" | "safety";

function PolicyBlock ({ icon, title, lines, onPress }: { icon: IconName; title: string; lines: readonly string[]; onPress: () => void }) {

    const theme = useTheme();

    return (
        <Press style={styles.blockRow} onPress={onPress} feel="dim" accessibilityRole="button" accessibilityLabel={title}>
            <Icon name={icon} size={theme.icon.xl} color={theme.ink.strong} />

            <Box style={styles.blockCopy} gap="1">
                <Text rank="title">{title}</Text>
                {lines.map(( line ) => <Text key={line} rank="description" ink="soft">{line}</Text>)}
            </Box>

            <Icon name={chevronNext} size={theme.icon.sm} tint="soft" />
        </Press>
    );

}

export function PolicyLinks ({ detail, voice, onOpen }: { detail: Detail; voice: Voice; onOpen: ( panel: PolicyPanel ) => void }) {

    const { t } = useTranslation();

    const cancellation = policyOf(detail, "cancellation");
    const ruling = policyOf(detail, "rules");
    const guarding = policyOf(detail, "safety");
    const safety = detail.features.filter(( item ) => item.group === "safety" );

    const stayLines = [
        ...( detail.checkin ? [ t("details.checkinWindow", { from: detail.checkin }) ] : [] ),
        ...( detail.checkout ? [ t("details.checkoutBefore", { time: detail.checkout }) ] : [] ),
        ...( detail.capacity > 0 ? [ t("details.capacity", { count: detail.capacity }) ] : [] ),
        ...detail.rules.map(( item ) => item.label ),
    ];

    const rows = [
        ...( sellable(detail) ? [ {
            key: "cancellation" as const,
            icon: "calendar" as IconName,
            title: t("details.cancellation"),
            lines: [
                ...( cancellation && cancellation.freeBeforeHours > 0 ? [ t("details.cancelFull", { hours: cancellation.freeBeforeHours, context: voice }) ] : [] ),
                cancellation?.description || t(`details.voice.${ voice }.cancellationBody`),
            ],
        } ] : [] ),
        ...( stayLines.length > 0 || ruling || staying(detail) ? [ {
            key: "rules" as const,
            icon: "key" as IconName,
            title: t(`details.voice.${ voice }.rules`),
            lines: stayLines.length > 0 ? stayLines.slice(0, 3) : [ ruling?.description || t(`details.voice.${ voice }.rulesBody`) ],
        } ] : [] ),
        ...( safety.length > 0 || guarding ? [ {
            key: "safety" as const,
            icon: "shield" as IconName,
            title: t(`details.voice.${ voice }.safety`),
            lines: safety.length > 0 ? safety.slice(0, 3).map(( item ) => item.label ) : [ guarding?.description || t(`details.voice.${ voice }.safetyBody`) ],
        } ] : [] ),
    ];

    return (
        <Box style={styles.rows}>
            {rows.map(( row ) => (
                <PolicyBlock
                    key={row.key}
                    icon={row.icon}
                    title={row.title}
                    lines={row.lines}
                    onPress={() => onOpen(row.key) }
                />
            ))}
        </Box>
    );

}

function FactRow ({ icon, label, body, divided }: { icon: IconName; label: string; body?: string | undefined; divided: boolean }) {

    const theme = useTheme();

    return (
        <Box>
            {divided ? <Divider /> : null}

            <Box style={styles.fact} row align="center" gap="4">
                <Icon name={icon} size={theme.icon.lg} />
                <Box style={styles.linkCopy} gap="1">
                    <Text rank="body">{label}</Text>
                    {body ? <Text rank="caption" ink="soft">{body}</Text> : null}
                </Box>
            </Box>
        </Box>
    );

}

function RefundRow ({ when, title, body, divided }: { when: string; title: string; body: string; divided: boolean }) {

    return (
        <Box>
            {divided ? <Divider /> : null}

            <Box style={styles.refund} row align="start" gap="4">
                <Text rank="label" style={styles.when}>{when}</Text>

                <Box style={styles.linkCopy} gap="1">
                    <Text rank="body">{title}</Text>
                    <Text rank="caption" ink="soft">{body}</Text>
                </Box>
            </Box>
        </Box>
    );

}

export function CancellationContent ({ detail }: { detail: Detail }) {

    const { t } = useTranslation();
    const policy = policyOf(detail, "cancellation");
    const hours = policy?.freeBeforeHours ?? 0;
    const penalty = policy?.penaltyPercent ?? 0;

    return (
        <Box gap="8">
            <Text rank="body" ink="soft">{policy?.description || t(`details.voice.${ voiceOf(detail) }.cancellationBody`)}</Text>

            {hours > 0 || penalty > 0 ? (
                <Box gap="4">
                    <Text rank="title">{t("details.cancellationTimeline")}</Text>

                    <Box>
                        {hours > 0 ? (
                            <RefundRow
                                when={t("details.cancelFullWhen", { hours })}
                                title={t("details.cancelFull", { hours, context: voiceOf(detail) })}
                                body={t("details.cancelFullBody")}
                                divided={false}
                            />
                        ) : null}

                        {penalty > 0 ? (
                            <RefundRow
                                when={t("details.cancelPartialWhen")}
                                title={t("details.cancelPartial")}
                                body={t("details.cancelPartialBody", { percent: penalty })}
                                divided={hours > 0}
                            />
                        ) : null}
                    </Box>
                </Box>
            ) : null}
        </Box>
    );

}

const ruleIcon = ( key: string ): IconName => {

    if ( key.includes("smok") ) return "smoking";
    if ( key.includes("pet") ) return "pets";
    if ( key.includes("party") ) return "party";

    return "shield";

};

export function RulesContent ({ detail }: { detail: Detail }) {

    const { t } = useTranslation();
    const policy = policyOf(detail, "rules");
    const voice = voiceOf(detail);

    const arrival: readonly Trait[] = [
        ...( detail.checkin ? [ { key: "checkin", label: t("details.checkinWindow", { from: detail.checkin }), value: "", text: "" } ] : [] ),
        ...( detail.checkout ? [ { key: "checkout", label: t("details.checkoutBefore", { time: detail.checkout }), value: "", text: "" } ] : [] ),
    ];

    return (
        <Box gap="8">
            <Text rank="body" ink="soft">{policy?.description || t(`details.voice.${ voice }.rulesBody`)}</Text>

            {arrival.length > 0 ? (
                <Box gap="3">
                    <Text rank="title">{t("details.arrivalDeparture")}</Text>

                    <Box>
                        {arrival.map(( row, index ) => (
                            <FactRow key={row.key} icon="clock" label={row.label} body={row.value} divided={index > 0} />
                        ))}
                    </Box>
                </Box>
            ) : null}

            {detail.rules.length > 0 ? (
                <Box gap="3">
                    <Text rank="title">{t("details.duringStay")}</Text>

                    <Box>
                        {detail.rules.map(( row, index ) => (
                            <FactRow key={row.key} icon={ruleIcon(row.key)} label={row.label} body={row.value} divided={index > 0} />
                        ))}
                    </Box>
                </Box>
            ) : null}
        </Box>
    );

}

export function SafetyContent ({ detail }: { detail: Detail }) {

    const { t } = useTranslation();
    const policy = policyOf(detail, "safety");
    const voice = voiceOf(detail);
    const safety = detail.features.filter(( item ) => item.group === "safety" );

    return (
        <Box gap="8">
            <Text rank="body" ink="soft">{policy?.description || t(`details.voice.${ voice }.safetyBody`)}</Text>

            {safety.length > 0 ? (
                <Box gap="3">
                    <Text rank="title">{t("details.safetyDevices")}</Text>

                    <Box>
                        {safety.map(( item, index ) => (
                            <FactRow key={item.key} icon={item.key.includes("camera") ? "camera" : "shield"} label={item.label} body={item.value} divided={index > 0} />
                        ))}
                    </Box>
                </Box>
            ) : null}
        </Box>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    blockRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: theme.space["4"],
        paddingVertical: theme.space["3"],
    },
    rows: {
        gap: theme.space["3"],
        marginVertical: -theme.space["3"],
    },
    blockCopy: {
        flex: 1,
    },
    linkCopy: {
        flex: 1,
    },
    fact: {
        minHeight: theme.art.sm + theme.space["5"],
        paddingVertical: theme.space["4"],
    },
    refund: {
        minHeight: theme.art.md + theme.space["4"],
        paddingVertical: theme.space["4"],
    },
    when: {
        width: theme.art.md - theme.space["1"],
    },

}));
