import { useEffect, useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Button } from "@/elements/button";
import { useCountdown } from "@/elements/hooks/use-countdown";
import { Icon } from "@/elements/icon";
import { Otp } from "@/elements/otp";
import { Press } from "@/elements/press";
import { Sheet } from "@/elements/sheet";
import { Text } from "@/elements/text";
import { timer } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

export type ConfirmCopy = {
    title: string;
    action: string;
    body: string;
    resend: string;
    code: string;
};

export type ConfirmChallenge = {
    destination: string;
    length: number | null;
    wait: number;
};

type ConfirmSheetProps = {
    open: boolean;
    copy: ConfirmCopy;
    busy?: boolean | undefined;
    wrong?: string | undefined;
    note?: string | undefined;
    length?: number | undefined;
    challenge?: ConfirmChallenge | null | undefined;
    onSubmit: ( code: string ) => void;
    onResend: () => void;
    onClose: () => void;
};

export function ConfirmSheet ({ open, copy, busy = false, wrong, note, length: fallback = 5, challenge, onSubmit, onResend, onClose }: ConfirmSheetProps) {

    const theme = useTheme();
    const length = challenge?.length ?? fallback;
    const { left, reset } = useCountdown(challenge?.wait ?? 0);

    const [ code, setCode ] = useState("");

    useEffect(() => {

        if ( open ) setCode("");

    }, [ open ]);

    useEffect(() => {

        reset(challenge?.wait ?? 0);

    }, [ challenge, reset ]);

    useEffect(() => {

        if ( wrong ) setCode("");

    }, [ wrong ]);

    const again = () => {

        setCode("");
        onResend();

    };

    const ready = code.length >= length;

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title={copy.title}
            footer={(
                <Button
                    label={copy.action}
                    loading={busy}
                    disabled={!ready}
                    onPress={() => onSubmit(code) }
                />
            )}
        >
            <View style={styles.copy}>
                <Text rank="body" ink="soft">{note ?? copy.body}</Text>
                {challenge?.destination ? <Text rank="label" ltr>{challenge.destination}</Text> : null}
            </View>

            <View style={styles.entry}>
                <Otp length={length} value={code} onChange={setCode} error={Boolean(wrong)} label={copy.code} autoFocus />

                {wrong ? <Text rank="caption" tint="danger" align="center">{wrong}</Text> : null}
            </View>

            <Press style={styles.again} onPress={again} disabled={busy || left > 0} sink="tile" accessibilityRole="button">
                <Icon name="refresh" size={theme.icon.sm} tint={left > 0 ? "faint" : "brand"} />
                <Text rank="label" ink={left > 0 ? "faint" : undefined} tint={left > 0 ? undefined : "brand"}>{left > 0 ? `${ copy.resend } · ${ timer(left) }` : copy.resend}</Text>
            </Press>
        </Sheet>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    copy: {
        paddingHorizontal: theme.space["1"],
    },
    entry: {
        gap: theme.space["3"],
    },
    again: {
        flexDirection: "row",
        alignSelf: "center",
        alignItems: "center",
        gap: theme.space["2"],
        paddingVertical: theme.space["2"],
    },

}));
