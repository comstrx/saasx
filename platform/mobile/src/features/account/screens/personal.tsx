import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Group } from "@/components/group";
import { Hint } from "@/components/hint";
import { Phone } from "@/components/phone";
import { Loading } from "@/components/states";
import { Alert } from "@/elements/alert";
import { AppBar } from "@/elements/app-bar";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Field } from "@/elements/field";
import { Stagger } from "@/elements/motion";
import { Otp } from "@/elements/otp";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Sheet } from "@/elements/sheet";
import { Text } from "@/elements/text";
import { AvatarBlock } from "@/features/account/components/avatar-block";
import { Detail } from "@/features/account/components/detail";
import { PasswordRules } from "@/features/auth/components/password-rules";
import { Guest, Trouble } from "@/features/shell";
import { useDials } from "@/features/shell/hooks/use-dials";
import { useSubmit } from "@/features/shell/hooks/use-submit";
import { retreat } from "@/features/shell/retreat";
import type { ContactField, ProfileEdit } from "@/model/account";
import { homeIso } from "@/model/country";
import { failureNote, failureShape } from "@/model/failure";
import { useAccount, useAvatar, useProfileEdit } from "@/query/account";
import { usePasswordPolicy } from "@/query/contract";
import { isolateLtr } from "@/std/bidi";
import { dialOf, e164 } from "@/std/identity";
import { strong } from "@/std/password";
import { notify } from "@/store/notice";
import { useSession } from "@/store/session";

type Slot = "name" | "phone" | "email" | "password" | "location";
type Verify = { field: ContactField; destination: string; standing: boolean };

const owned = [ "name", "phone", "email", "password", "old_password", "new_password", "address", "address_2", "zip_code", "code" ] as const;
const otpLength = 5;

const parts = ( full: string ) => {

    const words = full.trim().split(/\s+/).filter(Boolean);

    return { first: words[0] ?? "", last: words.slice(1).join(" ") };

};

export function PersonalScreen () {

    const { t } = useTranslation();
    const token = useSession(( state ) => state.token );
    const dials = useDials();
    const profile = useAccount();
    const { busy, fields, run } = useSubmit(owned);
    const avatar = useAvatar();
    const profileEdit = useProfileEdit();
    const policy = usePasswordPolicy();

    const me = profile.data;

    const [ open, setOpen ] = useState<Slot | null>(null);
    const [ verify, setVerify ] = useState<Verify | null>(null);
    const [ first, setFirst ] = useState("");
    const [ last, setLast ] = useState("");
    const [ iso, setIso ] = useState(homeIso);
    const [ digits, setDigits ] = useState("");
    const [ next, setNext ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ address, setAddress ] = useState("");
    const [ address2, setAddress2 ] = useState("");
    const [ zipCode, setZipCode ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ code, setCode ] = useState("");

    useEffect(() => {

        if ( !me || open ) return;

        const named = parts(me.name);

        setFirst(named.first);
        setLast(named.last);
        setEmail(me.email ?? "");
        setAddress(me.location?.address ?? "");
        setAddress2(me.location?.address2 ?? "");
        setZipCode(me.location?.zipCode ?? "");

    }, [ me, open ]);

    const close = () => {

        setOpen(null);
        setVerify(null);
        setPassword("");
        setNext("");
        setCode("");
        setDigits("");

    };

    const edit = ( slot: Slot ) => {

        setOpen(slot);
        setVerify(null);
        setPassword("");
        setCode("");
        if ( slot === "phone" ) setDigits("");
        if ( slot === "password" ) setNext("");

    };

    const done = ( message: string ) => {

        notify(message, "success");
        close();

    };

    const save = ( scope: string, edit: ProfileEdit ) => run(scope, ( attempt ) => profileEdit.mutateAsync({ edit, attempt }) );

    const saveName = async () => {

        const outcome = await save("account-name", { slot: "name", name: `${ first } ${ last }`.trim() });

        if ( outcome.ok ) done(t("personal.saved"));

    };

    const savePassword = async () => {

        const outcome = await save("account-password", { slot: "password", current: password, next });

        if ( outcome.ok ) done(t("personal.saved"));

    };

    const savePhone = async () => {

        const destination = e164(dialOf(dials, iso), digits);
        const outcome = await save("account-phone", { slot: "phone", phone: destination, password });

        if ( outcome.ok ) {

            setVerify({ field: "phone", destination, standing: false });
            setCode("");
            notify(t("personal.codeSent"), "success");

        }

    };

    const saveEmail = async () => {

        const destination = email.trim();
        const outcome = await save("account-email", { slot: "email", email: destination, password });

        if ( outcome.ok ) {

            setVerify({ field: "email", destination, standing: false });
            setCode("");
            notify(t("personal.codeSent"), "success");

        }

    };

    const saveLocation = async () => {

        const outcome = await save("account-location", {
            slot: "location",
            location: { address: address.trim(), address2: address2.trim(), zipCode: zipCode.trim() },
        });

        if ( outcome.ok ) done(t("personal.saved"));

    };

    const verifyNow = async ( field: ContactField, destination: string ) => {

        const outcome = await save(`account-send-${ field }`, { slot: "send", field });

        if ( outcome.ok ) {

            setVerify({ field, destination, standing: true });
            setCode("");
            notify(t("personal.verifySent"), "success");

        }

    };

    const confirm = async () => {

        if ( !verify ) return;

        const outcome = await save("account-contact", { slot: "contact", field: verify.field, code });

        if ( outcome.ok ) done(t("personal.verified"));

    };

    const location = me?.location;
    const addressValue = [ location?.address, location?.address2, location?.city, location?.country ]
        .filter(Boolean)
        .join(" · ");
    const editorTitle = open ? t(`personal.editor.${open}`) : "";
    const picker = {
        title: t("auth.pickCountry"),
        hint: t("auth.searchCountry"),
        empty: t("common.noMatches"),
        popular: t("common.popular"),
        all: t("common.allCountries"),
    };

    if ( !token ) return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("personal.title")} onBack={() => retreat() } />
            <Guest note={t("account.guestBody")} onLogin={() => router.push("/login") } />
        </Screen>
    );

    if ( !me ) {

        return (
            <Screen edges={[ "top" ]} padded={false}>
                <AppBar title={t("personal.title")} onBack={() => retreat() } />

                {profile.isPending
                    ? <Loading shape="rows" rows={5} />
                    : <Trouble reason={profile.error} onAction={() => void profile.refetch()} />}
            </Screen>
        );

    }

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("personal.title")} onBack={() => retreat() } />

            <Scroll contentContainerStyle={styles.scroll}>
                <Stagger>
                    <AvatarBlock
                        name={me?.name ?? ""}
                        image={me?.image ?? null}
                        busy={avatar.isPending}
                        onPick={( file ) => avatar.mutate(file, {
                            onSuccess: () => notify(t("personal.avatarSaved"), "success"),
                            onError: ( failure ) => notify(failureShape(failure).code === "unavailable" ? t("personal.avatarRejected") : failureNote(failure, "file")),
                        })}
                    />

                    <Group title={t("personal.groupInfo")} note={t("personal.legalNameHint")}>
                        <Detail
                            icon="user"
                            tone="brand"
                            label={t("personal.legalName")}
                            value={me?.name?.trim() ?? ""}
                            hint={t("personal.add")}
                            onPress={() => edit("name") }
                        />
                        <Detail
                            icon="phone"
                            tone="success"
                            label={t("personal.phone")}
                            value={isolateLtr(me?.phone?.trim() ?? "")}
                            hint={t("personal.add")}
                            verified={me?.phoneVerified}
                            pending={me.phone && !me.phoneVerified ? { label: t("personal.verifyNow"), onPress: () => { void verifyNow("phone", me.phone ?? ""); } } : undefined}
                            onPress={() => edit("phone") }
                        />
                        <Detail
                            icon="mail"
                            tone="accent"
                            label={t("personal.email")}
                            value={me?.email?.trim() ?? ""}
                            hint={t("personal.add")}
                            verified={me?.emailVerified}
                            pending={me.email && !me.emailVerified ? { label: t("personal.verifyNow"), onPress: () => { void verifyNow("email", me.email ?? ""); } } : undefined}
                            onPress={() => edit("email") }
                        />
                        <Detail
                            icon="location"
                            tone="info"
                            label={t("personal.address")}
                            value={addressValue}
                            hint={t("personal.add")}
                            onPress={() => edit("location") }
                        />
                    </Group>

                    <Group title={t("personal.groupSecurity")}>
                        <Detail
                            icon="lock"
                            tone="neutral"
                            label={t("personal.password")}
                            value={me?.hasPassword ? t("personal.passwordSet") : ""}
                            hint={t("personal.add")}
                            onPress={() => edit("password") }
                        />
                    </Group>
                </Stagger>
            </Scroll>

            <Alert
                open={verify !== null}
                title={t("personal.verifyTitle")}
                emblem="mail"
                body={verify ? t(verify.standing ? "personal.verifyNowBody" : "personal.verifyBody", { destination: isolateLtr(verify.destination), length: otpLength }) : undefined}
                confirm={t("personal.verifyAction")} onConfirm={confirm} busy={busy}
                cancel={t("common.cancel")}
                onClose={close}
            >
                <Box gap="3">
                    <Otp length={otpLength} value={code} onChange={setCode} error={Boolean(fields.code)} label={t("auth.codeLabel")} autoFocus />
                    {fields.code ? <Text rank="caption" tint="danger" align="center">{fields.code}</Text> : null}
                </Box>
            </Alert>

            <Sheet open={open !== null && !verify} onClose={close} title={editorTitle}
                scroll
            >
                {open === "name" ? (
                    <Box gap="4">
                        <Hint icon="info" text={t("personal.legalNameHint")} />
                        <Field placeholder={t("personal.firstName")} value={first} onChangeText={setFirst} autoComplete="name-given" error={fields.name} />
                        <Field placeholder={t("personal.lastName")} value={last} onChangeText={setLast} autoComplete="name-family" />
                        <Box style={styles.action}>
                            <Button label={t("personal.save")} loading={busy} disabled={!first.trim()} onPress={saveName} />
                        </Box>
                    </Box>
                ) : null}

                {open === "password" ? (
                    <Box gap="4">
                        <Hint icon="info" text={t("personal.passwordHint")} />
                        <Field
                            placeholder={t("personal.currentPassword")}
                            icon="lock"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            error={fields.old_password}
                        />
                        <Field
                            placeholder={t("personal.newPassword")}
                            icon="lock"
                            value={next}
                            onChangeText={setNext}
                            secureTextEntry
                            autoCapitalize="none"
                            error={fields.password ?? fields.new_password}
                        />
                        <PasswordRules value={next} policy={policy} />
                        <Box style={styles.action}>
                            <Button
                                label={t("personal.save")}
                                loading={busy}
                                disabled={!password || !strong(next, policy)}
                                onPress={savePassword}
                            />
                        </Box>
                    </Box>
                ) : null}

                {open === "phone" ? (
                    <Box gap="4">
                        <Hint icon="info" text={t("personal.phoneHint")} />
                        <Phone
                            dials={dials}
                            iso={iso}
                            onIso={setIso}
                            value={digits}
                            onChangeText={setDigits}
                            placeholder={t("auth.phone")}
                            picker={picker}
                            error={fields.phone}
                        />
                        <Field
                            placeholder={t("personal.passwordOptional")}
                            icon="lock"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            error={fields.password}
                        />
                        <Box style={styles.action}>
                            <Button label={t("personal.continue")} loading={busy} disabled={digits.length < 5} onPress={savePhone} />
                        </Box>
                    </Box>
                ) : null}

                {open === "email" ? (
                    <Box gap="4">
                        <Hint icon="info" text={t("personal.emailHint")} />
                        <Field
                            placeholder={t("auth.email")}
                            icon="mail"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            error={fields.email}
                        />
                        <Field
                            placeholder={t("personal.passwordOptional")}
                            icon="lock"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            error={fields.password}
                        />
                        <Box style={styles.action}>
                            <Button label={t("personal.continue")} loading={busy} disabled={!email.trim()} onPress={saveEmail} />
                        </Box>
                    </Box>
                ) : null}

                {open === "location" ? (
                    <Box gap="4">
                        <Hint icon="info" text={t("personal.addressHint")} />
                        <Field placeholder={t("personal.address")} icon="location" value={address} onChangeText={setAddress} error={fields.address} />
                        <Field placeholder={t("personal.address2")} value={address2} onChangeText={setAddress2} error={fields.address_2} />
                        <Field placeholder={t("personal.postal")} value={zipCode} onChangeText={setZipCode} error={fields.zip_code} />
                        <Box style={styles.action}>
                            <Button label={t("personal.save")} loading={busy} disabled={!address.trim()} onPress={saveLocation} />
                        </Box>
                    </Box>
                ) : null}
            </Sheet>
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    action: {
        paddingBottom: theme.space["2"],
    },
    scroll: {
        gap: theme.space["2"],
        paddingHorizontal: theme.layout.gutter,
        paddingTop: theme.space["2"],
    },

}));
