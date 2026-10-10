import { setStringAsync } from "expo-clipboard";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { css } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { Hint } from "@/components/hint";
import { Timeline } from "@/components/timeline";
import { AppBar } from "@/elements/app-bar";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Callout } from "@/elements/callout";
import { Divider } from "@/elements/divider";
import { Icon, type IconName } from "@/elements/icon";
import { Media } from "@/elements/media";
import { glides, Stagger } from "@/elements/motion";
import { useMotionActive } from "@/elements/motion/activity";
import { Press } from "@/elements/press";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Text, type TextTint } from "@/elements/text";
import { glyphOf } from "@/features/catalog/marks";
import { useMethod } from "@/features/shell/hooks/use-method";
import { useMoney } from "@/features/shell/hooks/use-money";
import type { Deal } from "@/model/catalog";
import { type CheckoutReceipt, type ReceiptPhase, receiptDue, receiptHasStay, troubled } from "@/model/receipt";
import { formatDateSpan } from "@/std/date-range";
import { formatDate } from "@/std/number";
import { notify } from "@/store/notice";
import { useTheme } from "@/theme/use-theme";

type CheckoutReceiptProps = {
    receipt: CheckoutReceipt;
    phase: ReceiptPhase;
    deal: Deal;
    more?: number | undefined;
    onOrder?: (() => void) | undefined;
    onOrders: () => void;
    onHome: () => void;
};

const seals: Record<ReceiptPhase, IconName> = {
    paid: "check",
    partial: "clock",
    settling: "clock",
    failed: "alert",
    declined: "alert",
};

const landing = css.keyframes({
    from: { opacity: 0, transform: [ { scale: 0.55 } ] },
    to: { opacity: 1, transform: [ { scale: 1 } ] },
});

const rippling = css.keyframes({
    from: { opacity: 0.55, transform: [ { scale: 1 } ] },
    to: { opacity: 0, transform: [ { scale: 1.75 } ] },
});

function Seal ({ phase }: { phase: ReceiptPhase }) {

    const theme = useTheme();
    const active = useMotionActive();
    const live = phase === "settling";

    const disc = !active ? null : { animationName: landing, animationDuration: glides.enter.duration, animationTimingFunction: glides.enter.easing, animationDelay: 120, animationFillMode: "backwards" } as const;
    const wave = !active ? null : { animationName: rippling, animationDuration: theme.beat.slow * ( live ? 3 : 2 ), animationIterationCount: live ? "infinite" : 1, animationDelay: 260 } as const;

    return (
        <View style={styles.sealBox}>
            <Animated.View style={[ styles.wave, !troubled(phase) && styles.waveLight, { opacity: 0 }, wave ]} />

            <Animated.View style={[ styles.seal, !troubled(phase) && styles.sealLight, disc ]}>
                <Icon name={seals[phase]} size={theme.icon.xl} tint={troubled(phase) ? "danger" : "brand"} />
            </Animated.View>
        </View>
    );

}

function InvoiceRow ({ label, value, strong = false, tint }: { label: string; value: string; strong?: boolean; tint?: TextTint }) {

    return (
        <Box row align="center" justify="between" gap="4">
            <Text rank={strong ? "label" : "body"} tint={tint} style={styles.grow}>
                {label}
            </Text>
            <Text rank={strong ? "title" : "body"} tint={tint} align="end" ltr>
                {value}
            </Text>
        </Box>
    );

}

function Fact ({ icon, label, value }: { icon: IconName; label: string; value: string }) {

    const theme = useTheme();

    return (
        <Box row align="center" gap="3" style={styles.grow}>
            <Box align="center" justify="center" style={styles.factIcon}>
                <Icon name={icon} size={theme.icon.md} tint="brand" />
            </Box>

            <Box gap="1" style={styles.grow}>
                <Text rank="caption" ink="soft" numberOfLines={2}>{label}</Text>
                <Text rank="action" numberOfLines={2}>{value}</Text>
            </Box>
        </Box>
    );

}

export function CheckoutReceiptView ({ receipt, phase, deal, more = 0, onOrder, onOrders, onHome }: CheckoutReceiptProps) {

    const { t, i18n } = useTranslation();
    const cash = useMoney();
    const method = useMethod();
    const theme = useTheme();
    const [ copied, setCopied ] = useState(false);

    const due = receiptDue(receipt);
    const money = ( value: number ) => cash.amount(value, receipt.currency);
    const dates = receipt.starts
        ? formatDateSpan(i18n.language, { start: receipt.starts, end: receipt.ends })
        : "";
    const heads = receipt.adults + receipt.children;
    const guests = heads > 0
        ? [
            t("checkout.guestsCount", { count: heads }),
            receipt.infants > 0 ? t("checkout.guestsInfants", { count: receipt.infants }) : "",
            receipt.pets > 0 ? t("checkout.guestsPets", { count: receipt.pets }) : "",
        ].filter(Boolean).join(" · ")
        : "";
    const issued = formatDate(i18n.language, receipt.createdAt, "medium");
    const ready = receiptHasStay(receipt) || receipt.total > 0;
    const done = phase === "paid";
    const status = t(`thanks.${ phase }Status`);
    const badge: IconName = done ? "shield" : troubled(phase) ? "alert" : "clock";

    const copy = async () => {

        if ( !receipt.reference ) return;

        await setStringAsync(receipt.reference);
        setCopied(true);
        notify(t("thanks.copied"), "success");

    };

    useEffect(() => {

        if ( !copied ) return;

        const timer = setTimeout(() => setCopied(false), theme.beat.slow * 4);

        return () => clearTimeout(timer);

    }, [ copied, theme.beat.slow ]);

    const facts = [
        dates ? { key: "dates", icon: "calendar" as IconName, label: t("thanks.dates"), value: dates } : null,
        guests ? { key: "guests", icon: "users" as IconName, label: t("thanks.guests"), value: guests } : null,
        receipt.nights > 0 ? { key: "nights", icon: "moon" as IconName, label: t("thanks.nights"), value: t("details.nights", { count: receipt.nights }) } : null,
        receipt.payment ? { key: "payment", icon: "card" as IconName, label: t("thanks.payment"), value: method(receipt.payment) } : null,
    ].filter(( fact ) => fact !== null );

    const pairs = facts.reduce<( typeof facts )[]>(( rows, fact ) => {

        const last = rows[rows.length - 1];

        if ( fact.key === "dates" || !last || last.length === 2 || last[0]?.key === "dates" ) rows.push([ fact ]);
        else last.push(fact);

        return rows;

    }, []);

    const dark = troubled(phase);
    const ledger = receipt.tax > 0
        ? [ <InvoiceRow key="tax" label={t("thanks.tax")} value={money(receipt.tax)} /> ]
        : [];

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("thanks.header")} onBack={onHome} />

            <Scroll contentContainerStyle={styles.page}>
                <Stagger>
                    <View key="intro">
                        <Hint icon="info" text={t("thanks.intro", { context: deal })} />
                    </View>

                    <Box key="hero" plane={dark ? "stage" : "base"} depth={dark ? undefined : "flat"} curve="card" clip style={styles.hero}>
                        <Box align="center" gap="4" style={styles.heroBody}>
                            <Seal phase={phase} />

                            <Box align="center" gap="2" style={styles.heroCopy}>
                                <Text rank="heading" tint={dark ? "on" : undefined} align="center" numberOfLines={1}>{t(`thanks.${ phase }Title`, { context: deal })}</Text>
                                <Text rank="body" tint={dark ? "on" : undefined} ink="soft" align="center" style={dark ? styles.faded : undefined}>{t(`thanks.${ phase }Body`, { context: deal })}</Text>
                            </Box>

                            <Box row align="center" gap="2" style={[ styles.badge, !dark && styles.badgeLight ]}>
                                <Icon name={badge} size={theme.icon.sm} tint={dark ? "lit" : "brand"} />
                                <Text rank="label" tint={dark ? "on" : "brand"}>{status}</Text>
                            </Box>

                            {receipt.reference ? (
                                <Press
                                    style={[ styles.reference, !dark && styles.badgeLight ]}
                                    onPress={() => { void copy(); }}
                                    hitSlop={theme.hit.slop}
                                    accessibilityRole="button"
                                    accessibilityLabel={t("thanks.reference")}
                                >
                                    <Text rank="caption" tint={dark ? "on" : undefined} ink="soft" style={dark ? styles.faded : undefined}>{t("thanks.reference")}</Text>
                                    <Text rank="label" tint={dark ? "on" : undefined} ltr>{receipt.reference}</Text>
                                    <Icon name={copied ? "check" : "copy"} size={theme.icon.sm} tint={dark ? "lit" : "brand"} />
                                </Press>
                            ) : null}
                        </Box>
                    </Box>

                    {more > 0 ? (
                        <View key="more">
                            <Callout tint="info" icon="orders" body={t("thanks.more", { count: more })} />
                        </View>
                    ) : null}

                    {ready ? (
                        <View key="booking" style={styles.booking}>
                            <Box row align="center" gap="4">
                                <Media
                                    source={receipt.image}
                                    icon={glyphOf(receipt.type)}
                                    ratio={1}
                                    curve="control"
                                    scrim={false}
                                    style={styles.media}
                                />

                                <Box gap="1" style={styles.grow}>
                                    <Text rank="label" numberOfLines={2}>{receipt.title}</Text>
                                </Box>
                            </Box>

                            <Divider />

                            {facts.length > 0 ? (
                                <Box gap="3">
                                    {pairs.map(( pair, slot ) => (
                                        <Box align="stretch" key={pair[0]?.key ?? slot} row gap="3">
                                            {pair.map(( fact ) => (
                                                <Fact key={fact.key} icon={fact.icon} label={fact.label} value={fact.value} />
                                            ))}
                                        </Box>
                                    ))}
                                </Box>
                            ) : null}
                        </View>
                    ) : null}

                    <View key="invoice" style={styles.ticket}>
                        <Box gap="2" style={styles.ticketHead}>
                            <Box row align="center" justify="between" gap="3">
                                <Box row align="center" gap="2" style={styles.grow}>
                                    <Icon name="ticket" size={theme.icon.lg} tint="brand" />
                                    <Text rank="title" numberOfLines={1} style={styles.grow}>{t("thanks.invoice", { context: deal })}</Text>
                                </Box>

                                <Text rank="label" ink={done ? undefined : troubled(phase) ? undefined : "soft"} tint={done ? "success" : troubled(phase) ? "danger" : undefined} numberOfLines={1}>{status}</Text>
                            </Box>

                            {issued ? (
                                <Box row align="center" justify="between" gap="3">
                                    <Text rank="caption" ink="soft" style={styles.grow}>{t("thanks.issued")}</Text>
                                    <Text rank="caption" align="end">{issued}</Text>
                                </Box>
                            ) : null}
                        </Box>

                        <View style={styles.seam}>
                            <View style={[ styles.notch, styles.notchStart ]} />
                            <View style={styles.dashes}>{perforation.map(( dash ) => <View key={dash} style={styles.dash} />)}</View>
                            <View style={[ styles.notch, styles.notchEnd ]} />
                        </View>

                        <Box gap="3" style={styles.ticketBody}>
                            {ledger}
                            {ledger.length > 0 ? <Divider /> : null}

                            <InvoiceRow label={t("thanks.total")} value={money(receipt.total)} strong />
                            <InvoiceRow label={t("thanks.paid")} value={money(receipt.paid)} tint="success" />
                            {due > 0 ? <InvoiceRow label={t("thanks.due")} value={money(due)} tint="danger" /> : null}
                        </Box>
                    </View>

                    {done ? (
                        <View key="next" style={styles.next}>
                            <Text rank="title">{t("thanks.nextTitle")}</Text>

                            <Timeline
                                beats={[
                                    { key: "confirm", title: t("thanks.stepConfirmTitle"), note: t("thanks.stepConfirmBody"), icon: "checkCircle" },
                                    { key: "prepare", title: t("thanks.stepPrepareTitle", { context: deal }), note: t("thanks.stepPrepareBody", { context: deal }), icon: "clock" },
                                    { key: "support", title: t("thanks.stepSupportTitle"), note: t("thanks.stepSupportBody", { context: deal }), icon: "support" },
                                ]}
                            />
                        </View>
                    ) : null}

                    <Box key="actions" gap="3">
                        {onOrder ? <Button label={phase === "declined" ? t("orders.payNow") : t("thanks.order", { context: deal })} icon={phase === "declined" ? "wallet" : "ticket"} onPress={onOrder} /> : null}
                        <Button label={t("thanks.orders")} kind={onOrder ? "soft" : "solid"} tint={onOrder ? "neutral" : "brand"} icon="orders" onPress={onOrders} />
                        <Button label={t("thanks.home")} kind="ghost" tint="neutral" icon="home" onPress={onHome} />
                    </Box>
                </Stagger>
            </Scroll>
        </Screen>
    );

}

const perforation = Array.from({ length: 24 }, ( _, slot ) => `dash-${ slot }`);

const styles = StyleSheet.create(( theme, runtime ) => ({

    grow: {
        flex: 1,
        minWidth: 0,
    },
    hero: {
        borderRadius: theme.radius.panel,
    },
    heroCopy: {
        alignSelf: "stretch",
    },
    heroBody: {
        paddingVertical: theme.space["8"],
        paddingHorizontal: theme.layout.gutter,
    },
    faded: {
        opacity: theme.state.quiet,
    },
    sealBox: {
        width: theme.art.sm,
        height: theme.art.sm,
        alignItems: "center",
        justifyContent: "center",
    },
    wave: {
        position: "absolute",
        width: theme.art.sm,
        height: theme.art.sm,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.photo.chipEdge,
    },
    waveLight: {
        backgroundColor: theme.tone.brand.soft,
    },
    seal: {
        width: theme.control.lg.height,
        height: theme.control.lg.height,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.pill,
        backgroundColor: theme.material.lit,
    },
    sealLight: {
        backgroundColor: theme.tone.brand.soft,
    },
    badge: {
        paddingVertical: theme.space["2"],
        paddingHorizontal: theme.space["4"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.photo.chipEdge,
    },
    badgeLight: {
        backgroundColor: theme.tone.brand.soft,
    },
    reference: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["2"],
        paddingVertical: theme.space["2"],
        paddingHorizontal: theme.space["4"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.photo.chipEdge,
    },
    booking: {
        ...theme.card,
        gap: theme.space["4"],
        padding: theme.space["4"],
    },
    media: {
        width: theme.art.md - theme.space["2"],
        height: theme.art.md - theme.space["2"],
    },
    factIcon: {
        width: theme.control.sm.height,
        height: theme.control.sm.height,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.brand.soft,
    },
    ticket: {
        ...theme.card,
        position: "relative",
        overflow: "hidden",
    },
    ticketHead: {
        padding: theme.space["5"],
    },
    ticketBody: {
        padding: theme.space["5"],
    },
    seam: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.plane.base,
    },
    dashes: {
        flex: 1,
        flexDirection: "row",
        gap: theme.space["1"],
        marginHorizontal: theme.space["3"],
    },
    dash: {
        flex: 1,
        height: theme.stroke.base,
        backgroundColor: theme.line.strong,
    },
    notch: {
        width: theme.space["3"],
        height: theme.space["6"],
        backgroundColor: theme.plane.canvas,
    },
    notchStart: {
        borderStartEndRadius: theme.radius.pill,
        borderEndEndRadius: theme.radius.pill,
    },
    notchEnd: {
        borderStartStartRadius: theme.radius.pill,
        borderEndStartRadius: theme.radius.pill,
    },
    next: {
        ...theme.card,
        gap: theme.space["4"],
        padding: theme.space["5"],
    },
    step: {
        width: theme.control.sm.height - theme.space["2"],
        height: theme.control.sm.height - theme.space["2"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.brand.soft,
    },
    page: {
        gap: theme.layout.stack,
        paddingHorizontal: theme.layout.gutter,
        paddingBottom: runtime.insets.bottom + theme.space["7"],
    },

}));
