import { router } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { release } from "@/brand/release";
import { Group } from "@/components/group";
import { Loading, Phased, phaseOf } from "@/components/states";
import { Alert } from "@/elements/alert";
import { AppBar } from "@/elements/app-bar";
import { usePull } from "@/elements/hooks/use-pull";
import { Menu } from "@/elements/menu";
import { Stagger } from "@/elements/motion";
import { Round } from "@/elements/round";
import { Row } from "@/elements/row";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Text } from "@/elements/text";
import { Preferences } from "@/features/account/components/preferences";
import { ProfileHead } from "@/features/account/components/profile-head";
import { Guest, Trouble } from "@/features/shell";
import { LegalRows } from "@/features/shell/components/legal-rows";
import { concepts } from "@/features/shell/concepts";
import { useMoney } from "@/features/shell/hooks/use-money";
import { retreat } from "@/features/shell/retreat";
import { allows } from "@/model/account";
import { countOf } from "@/model/cart";
import { useAccount, useLevel } from "@/query/account";
import { useCart } from "@/query/cart";
import { useAlertCount } from "@/query/notifications";
import { useSession } from "@/store/session";

export function AccountScreen () {

    const { t } = useTranslation();
    const token = useSession(( state ) => state.token );
    const close = useSession(( state ) => state.close );
    const [ leaving, setLeaving ] = useState(false);
    const [ menuing, setMenuing ] = useState(false);
    const more = useRef<View>(null);
    const cash = useMoney();
    const level = useLevel();
    const profile = useAccount();
    const alerts = useAlertCount();
    const basket = useCart();
    const pull = usePull(profile.refetch);

    const account = profile.data;
    const unread = token ? alerts.data?.unread ?? 0 : 0;
    const carted = countOf(basket.data?.lines ?? []);
    const purse = account?.wallet;

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar
                onBack={() => retreat() }
                actions={token ? (
                    <>
                        <Round icon="bell" count={unread} onPress={() => router.push("/notifications") } label={t("home.alerts")} />
                        <View ref={more} collapsable={false}>
                            <Round icon="more" onPress={() => setMenuing(true) } label={t("common.more")} />
                        </View>
                    </>
                ) : undefined}
            />

            <Scroll refreshing={pull.refreshing} onRefresh={token ? pull.onRefresh : undefined} contentContainerStyle={styles.page}>
                {!token ? (
                    <Stagger>
                        <Guest look="card" onLogin={() => router.push("/login") } />

                        <Preferences />

                        <LegalRows />
                    </Stagger>
                ) : (
                    <Phased
                        gap="3"
                        phase={phaseOf(profile.isPending && !account, profile.isError && !account, false)}
                        loading={<Loading shape="rows" rows={6} />}
                        failed={<Trouble reason={profile.error} onRetry={() => { void profile.refetch(); }} />}
                    >
                        {account ? (
                            <Stagger>
                                <ProfileHead account={account} />

                                <Group>
                                    {allows(account, "view_orders") ? <Row key="orders" plated tone={concepts.orders} icon="orders" title={t("account.orders")} note={t("account.ordersNote")} onPress={() => router.push("/orders") } /> : null}
                                    <Row key="favorites" plated tone={concepts.favorites} icon="heart" title={t("account.favorites")} note={t("account.favoritesNote")} onPress={() => router.push("/favorites") } />
                                    <Row key="cart" plated tone={concepts.cart} icon="cart" title={t("cart.title")} note={t("account.cartNote")} value={carted > 0 ? String(carted) : undefined} onPress={() => router.push("/cart") } />
                                </Group>

                                <Group>
                                    {allows(account, "view_wallets") ? <Row key="wallet" plated tone={concepts.wallet} icon="wallet" title={t("account.wallet")} note={t("account.walletNote")} value={purse ? cash.amount(purse.available, purse.currency) : undefined} onPress={() => router.push("/wallet") } /> : null}
                                    {allows(account, "view_coupons") ? <Row key="coupons" plated tone={concepts.coupons} icon="coupon" title={t("coupons.title")} note={t("account.rewardsNote")} onPress={() => router.push("/coupons") } /> : null}
                                    <Row key="level" plated tone={concepts.level} icon="award" title={t("level.title")} note={t("account.levelNote")} value={level.data?.name || undefined} onPress={() => router.push("/level") } />
                                    <Row key="referrals" plated tone={concepts.referrals} icon="invite" title={t("referrals.title")} note={t("account.referralsNote")} onPress={() => router.push("/referrals") } />
                                </Group>

                                <Group>
                                    <Row key="personal" plated tone={concepts.personal} icon="user" title={t("settings.personal")} note={t("account.personalBody")} onPress={() => router.push("/personal") } />
                                    <Row key="sessions" plated tone={concepts.sessions} icon="device" title={t("sessions.title")} note={t("sessions.body")} onPress={() => router.push("/sessions") } />
                                    {allows(account, "allow_notifications") ? <Row key="notify" plated tone={concepts.notify} icon="bell" title={t("settings.notifications")} note={t("settings.notificationsBody")} onPress={() => router.push("/notify") } /> : null}
                                    <Row key="settings" plated tone={concepts.settings} icon="settings" title={t("account.settings")} note={t("account.settingsNote")} onPress={() => router.push("/settings") } />
                                </Group>

                                <Group title={t("account.help")}>
                                    <Row key="desk" plated tone={concepts.desk} icon="chat" title={t("account.support")} note={t("account.supportNote")} onPress={() => router.push({ pathname: "/chat", params: { desk: String(Date.now()) } }) } />
                                    {allows(account, "view_tickets") ? <Row key="tickets" plated tone={concepts.tickets} icon="support" title={t("tickets.title")} note={t("account.ticketsNote")} onPress={() => router.push("/tickets") } /> : null}
                                    <Row key="contact" plated tone={concepts.contact} icon="phone" title={t("contact.title")} note={t("account.contactNote")} onPress={() => router.push("/contact") } />
                                </Group>

                                <LegalRows />

                                <Text rank="caption" ink="faint" align="center" style={styles.version}>{t("account.version", { value: release.version })}</Text>
                            </Stagger>
                        ) : null}
                    </Phased>
                )}
            </Scroll>

            <Menu
                open={menuing}
                anchor={more}
                onClose={() => setMenuing(false) }
                items={[ { key: "logout", label: t("account.logout"), icon: "logout", onPress: () => setLeaving(true) } ]}
            />

            <Alert
                open={leaving}
                title={t("account.logoutConfirm")}
                body={t("account.logoutBody")}
                emblem="lock"
                tone="danger"
                confirm={t("account.logout")}
                cancel={t("common.back")}
                onConfirm={() => { setLeaving(false); close(); }}
                onClose={() => setLeaving(false) }
            />
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    page: {
        gap: theme.space["3"],
        paddingHorizontal: theme.layout.gutter,
        paddingTop: theme.space["1"],
    },
    version: {
        paddingTop: theme.space["2"],
    },

}));
