import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Avatar } from "@/elements/avatar";
import { tooLarge, useImagePick } from "@/elements/hooks/use-image-pick";
import { Icon } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Row } from "@/elements/row";
import { Sheet } from "@/elements/sheet";
import { Text } from "@/elements/text";
import { uploadCap } from "@/model/contract";
import { useLimits } from "@/query/contract";
import type { UploadFile } from "@/std/file";
import { notify } from "@/store/notice";
import { useTheme } from "@/theme/use-theme";

type AvatarBlockProps = {
    name: string;
    image: string | null;
    busy?: boolean | undefined;
    onPick: ( file: UploadFile | null ) => void;
};

export function AvatarBlock ({ name, image, busy = false, onPick }: AvatarBlockProps) {

    const { t } = useTranslation();
    const theme = useTheme();
    const limits = useLimits();
    const cap = uploadCap(limits.data, "user");
    const picker = useImagePick(cap);

    const [ open, setOpen ] = useState(false);

    const take = ( source: "library" | "camera" ) => {

        setOpen(false);

        void ( async () => {

            try {

                const file = source === "camera" ? await picker.fromCamera() : await picker.fromLibrary();

                if ( file ) onPick(file);

            }
            catch ( reason ) {

                notify(reason instanceof Error && reason.message === tooLarge
                    ? t("personal.avatarTooLarge", { value: Math.floor(cap / ( 1024 * 1024 )) })
                    : t("personal.avatarDenied"));

            }

        } )();

    };

    return (
        <>
            <Press
                style={styles.block}
                onPress={() => setOpen(true) }
                disabled={busy}
                feel="dim"
                muted={1}
                accessibilityRole="button"
                accessibilityLabel={t("personal.avatarChange")}
            >
                <View>
                    <Avatar name={name} source={image ?? undefined} size={theme.composition.member.avatar} halo />

                    <View style={styles.badge}>
                        {busy
                            ? <ActivityIndicator size="small" color={theme.material.lit} />
                            : <Icon name="camera" size={theme.icon.sm} tint="lit" />}
                    </View>
                </View>

                <View style={styles.copy}>
                    <Text rank="heading" numberOfLines={1}>{name}</Text>
                    <Text rank="label" tint="brand">{t("personal.avatarAction")}</Text>
                </View>
            </Press>

            <Sheet open={open} onClose={() => setOpen(false) } title={t("personal.avatarChange")}>
                <Row plated
                    icon="image"
                    title={t("personal.avatarLibrary")}
                    onPress={() => take("library") }
                />
                <Row plated
                    icon="camera"
                    title={t("personal.avatarCamera")}
                    onPress={() => take("camera") }
                />

                {image ? (
                    <Row plated
                        icon="trash"
                        title={t("personal.avatarRemove")}
                        tint="danger"
                        onPress={() => { setOpen(false); onPick(null); }}
                    />
                ) : null}
            </Sheet>
        </>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    block: {
        ...theme.card,
        borderRadius: theme.radius.panel,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["4"],
        padding: theme.space["4"],
    },
    copy: { flex: 1, gap: theme.space["1"] },
    badge: {
        position: "absolute",
        bottom: 0,
        insetInlineEnd: 0,
        width: theme.toggle.knob,
        height: theme.toggle.knob,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.pill,
        borderWidth: theme.stroke.base,
        borderColor: theme.plane.canvas,
        backgroundColor: theme.tone.brand.base,
    },

}));
