import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { AppBar } from "@/elements/app-bar";
import type { IconName } from "@/elements/icon";
import { Round } from "@/elements/round";
import { Search } from "@/elements/search";
import { Tabs } from "@/elements/tabs";

export type RoomKind = "all" | "p2p" | "support";

const kindGlyphs: Readonly<Record<RoomKind, IconName>> = {
    all: "messages",
    p2p: "users",
    support: "support",
};

type MessagesHeadProps = {
    title: string;
    kind: RoomKind;
    kinds: readonly RoomKind[];
    query: string;
    bare?: boolean;
    more: RefObject<View | null>;
    onBack: () => void;
    onKind: ( kind: RoomKind ) => void;
    onQuery: ( query: string ) => void;
    onMore: () => void;
};

export function MessagesHead ( props: MessagesHeadProps ) {

    const { t } = useTranslation();

    return (
        <AppBar
            title={props.title}
            tone="base"
            onBack={props.onBack}
            actions={props.bare ? undefined : (
                <View ref={props.more} collapsable={false}>
                    <Round icon="more" onPress={props.onMore} label={t("common.more")} />
                </View>
            )}
        >
            {props.bare ? null : (
                <>
                    <Search value={props.query} onChangeText={props.onQuery} placeholder={t("chat.search")} autoCorrect={false} />

                    <Tabs
                        active={props.kind}
                        onPick={props.onKind}
                        options={props.kinds.map(( kind ) => ({ key: kind, label: t(`chat.kindFilter.${ kind }`), icon: kindGlyphs[kind] }) )}
                    />
                </>
            )}
        </AppBar>
    );

}
