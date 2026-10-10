import { router } from "expo-router";
import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Group } from "@/components/group";
import { Loading, Phased, phaseOf } from "@/components/states";
import { Alert } from "@/elements/alert";
import { AppBar } from "@/elements/app-bar";
import { Box } from "@/elements/box";
import { Emblem } from "@/elements/emblem";
import { Empty } from "@/elements/empty";
import { usePull } from "@/elements/hooks/use-pull";
import { Plate } from "@/elements/plate";
import { Press } from "@/elements/press";
import { Row, Seam } from "@/elements/row";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Text } from "@/elements/text";
import { Guest, Trouble } from "@/features/shell";
import { useWhen } from "@/features/shell/hooks/use-when";
import { retreat } from "@/features/shell/retreat";
import { type Device, type DeviceKind, deviceKind, deviceLabel, otherDevices } from "@/model/session";
import { useDevices, useRevokeDevice } from "@/query/sessions";
import { isolateLtr } from "@/std/bidi";
import { notify } from "@/store/notice";
import { useSession } from "@/store/session";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

const hues: Readonly<Record<DeviceKind, ToneName>> = { android: "success", apple: "neutral", windows: "info", linux: "warning", chrome: "danger", browser: "accent", device: "brand" };

function DeviceRow ({ device, onPress }: { device: Device; onPress?: (() => void) | undefined }) {

    const { t } = useTranslation();
    const theme = useTheme();
    const when = useWhen();
    const seamed = useContext(Seam);
    const kind = deviceKind(device);
    const seen = device.seenAt ?? device.at;
    const label = deviceLabel(device, t("sessions.app"), t("sessions.unknown"));
    const status = device.mine ? t("sessions.online") : seen ? t("sessions.seen", { at: when.stamp(seen) }) : "";

    return (
        <Press feel="ripple" muted={1} onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? "button" : "none"} accessibilityLabel={label} accessibilityHint={onPress ? t("sessions.revoke") : undefined}>
            <View style={styles.device}>
                {seamed ? <View pointerEvents="none" style={styles.seam} /> : null}

                <Plate icon={kind} size={theme.composition.devices.face} tone={hues[kind]} look="vivid" />

                <View style={styles.copy}>
                    <Text rank="title" numberOfLines={1}>{label}</Text>
                    {device.ip ? <Text rank="body" numberOfLines={1}>{isolateLtr(device.ip)}</Text> : null}
                    {status ? <Text rank="caption" ink="soft" numberOfLines={1}>{status}</Text> : null}
                </View>
            </View>
        </Press>
    );

}

export function SessionsScreen () {

    const { t } = useTranslation();
    const token = useSession(( state ) => state.token );
    const theme = useTheme();

    const devices = useDevices();

    const pull = usePull(devices.refetch);
    const revoke = useRevokeDevice();

    const rows = devices.data ?? [];
    const mine = rows.find(( device ) => device.mine );
    const others = useMemo(() => otherDevices(rows), [ rows ]);

    const [ pending, setPending ] = useState<{ id: number | null } | null>(null);

    const drop = ( id: number | null ) => revoke.mutate(id, {
        onSuccess: () => notify(t(id === null ? "sessions.revokedAll" : "sessions.revoked"), "success"),
    });

    if ( !token ) return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("sessions.title")} onBack={() => retreat() } />
            <Guest note={t("account.guestBody")} onLogin={() => router.push("/login") } />
        </Screen>
    );

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("sessions.title")} onBack={() => retreat() } />

            <Scroll
                contentContainerStyle={styles.scroll}
                refreshing={pull.refreshing}
                onRefresh={pull.onRefresh}
            >
                <Box plane="base" curve="panel" align="center" gap="5" padX="5" padY="6">
                    <Emblem name="phone" size={theme.composition.devices.art} />
                    <Text rank="body" align="center">{t("sessions.note")}</Text>
                </Box>

                <Phased
                    gap="4"
                    phase={phaseOf(devices.isPending && !devices.data, devices.isError && !devices.data, rows.length === 0)}
                    loading={<Loading shape="rows" rows={3} />}
                    failed={<Trouble reason={devices.error} onRetry={() => { void devices.refetch(); }} />}
                    empty={<Empty emblem="phone" title={t("sessions.emptyTitle")} />}
                >
                    {mine ? (
                        <Group title={t("sessions.thisDevice")} note={others.length > 0 ? t("sessions.othersNote") : undefined}>
                            <DeviceRow key={mine.id} device={mine} />

                            {others.length > 0 ? (
                                <Seam key="others" value={false}>
                                    <Row icon="hand" tint="danger" title={t("sessions.revokeAll")} onPress={() => setPending({ id: null }) } />
                                </Seam>
                            ) : null}
                        </Group>
                    ) : null}

                    {others.length > 0 ? (
                        <Group title={t("sessions.active")} note={t("sessions.tapNote")}>
                            {others.map(( device ) => <DeviceRow key={device.id} device={device} onPress={() => setPending({ id: device.id }) } /> )}
                        </Group>
                    ) : null}
                </Phased>
            </Scroll>

            <Alert
                open={pending !== null}
                title={pending?.id === null ? t("sessions.revokeAll") : t("sessions.revoke")}
                body={t("sessions.revokeNote")}
                emblem="phone"
                confirm={t("common.confirm")} onConfirm={() => {

                    if ( pending ) drop(pending.id);

                    setPending(null);

                }} tone="danger"
                cancel={t("common.cancel")}
                onClose={() => setPending(null)}
            />
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    scroll: {
        flexGrow: 1,
        gap: theme.space["4"],
        paddingHorizontal: theme.layout.gutter,
    },
    device: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: theme.composition.devices.gap,
        paddingHorizontal: theme.composition.devices.pad,
        paddingVertical: theme.composition.devices.padY,
    },
    seam: {
        position: "absolute",
        top: 0,
        insetInlineStart: theme.composition.devices.pad + theme.composition.devices.face + theme.composition.devices.gap,
        insetInlineEnd: 0,
        height: theme.stroke.hair,
        backgroundColor: theme.line.hair,
    },
    copy: {
        flex: 1,
    },

}));
