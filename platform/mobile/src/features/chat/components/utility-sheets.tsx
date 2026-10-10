import { useTranslation } from "react-i18next";
import { EmojiBoard } from "@/components/emoji-board";
import { Group } from "@/components/group";
import { Avatar } from "@/elements/avatar";
import { Icon } from "@/elements/icon";
import { Plate } from "@/elements/plate";
import { Row } from "@/elements/row";
import { Sheet } from "@/elements/sheet";
import { platform, type Room } from "@/model/chat";
import { useTheme } from "@/theme/use-theme";

type ChatUtilitySheetsProps = {
    rooms: readonly Room[];
    attachmentOpen: boolean;
    emojiOpen: boolean;
    forwardOpen: boolean;
    onCloseAttachment: () => void;
    onCloseEmoji: () => void;
    onCloseForward: () => void;
    onPickMedia: () => void;
    onTakePhoto: () => void;
    onPickDocument: () => void;
    onEmoji: ( emoji: string ) => void;
    onForward: ( room: Room ) => void;
};

export function ChatUtilitySheets ( props: ChatUtilitySheetsProps ) {

    const { t } = useTranslation();
    const theme = useTheme();
    const seat = theme.control.sm.height;

    return (
        <>
            <Sheet open={props.attachmentOpen} onClose={props.onCloseAttachment} title={t("chat.attach")}>
                <Group>
                    <Row key="photos" icon="image" plated title={t("chat.photos")} note={t("chat.photosBody")} onPress={props.onPickMedia} />
                    <Row key="camera" icon="camera" plated title={t("chat.camera")} note={t("chat.cameraBody")} onPress={props.onTakePhoto} />
                    <Row key="document" icon="file" plated title={t("chat.document")} note={t("chat.documentBody")} onPress={props.onPickDocument} />
                </Group>
            </Sheet>

            <Sheet open={props.emojiOpen} onClose={props.onCloseEmoji} title={t("chat.emoji")}>
                <EmojiBoard
                    copy={{ search: t("chat.emojiSearch"), none: t("chat.emojiNone"), group: ( key ) => t(`chat.emojiGroup.${ key }`) }}
                    onPick={props.onEmoji}
                />
            </Sheet>

            <Sheet open={props.forwardOpen} onClose={props.onCloseForward} title={t("chat.forwardTo")} scroll>
                <Group>
                    {props.rooms.map(( target ) => (
                        <Row
                            key={target.id}
                            figure={platform(target)
                                ? <Plate icon="support" size={seat} look="solid" />
                                : <Avatar name={target.name} source={target.image ?? undefined} size={seat} ring={target.online} />}
                            title={target.name}
                            note={target.note || target.lastLine}
                            onPress={() => props.onForward(target)}
                            trailing={<Icon name="send" size={theme.icon.md} tint="brand" />}
                        />
                    ))}
                </Group>
            </Sheet>
        </>
    );

}
