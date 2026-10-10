"use client";

import Menu from "@/elements/menu";
import Icon from "@/icons/icon";

type Flags = { muted: boolean; pinned: boolean; archived: boolean; blocked: boolean };
type Props = {
    flags: Flags; disabled: boolean;
    labels: { actions: string; toggles: Record<keyof Flags, { on: string; off: string }>; report: string; delete: string };
    onToggle: ( key: keyof Flags ) => void; onReport: () => void; onDelete: () => void;
};

const glyphs = { pinned: "push-pin", muted: "bell-slash", archived: "archive", blocked: "ban" } as const;
const order: readonly (keyof Flags)[] = ["pinned", "muted", "archived", "blocked"];

export default function ChatRoomTools ({ flags, disabled, labels, onToggle, onReport, onDelete }: Props) {

    return (

        <Menu
            label={labels.actions}
            look="ghost"
            align="end"
            trigger={<Icon name="dots" />}
            sections={[
                {
                    key: "room",
                    items: order.map(( key ) => ({
                        key, label: flags[key] ? labels.toggles[key].off : labels.toggles[key].on, icon: <Icon name={glyphs[key]} />,
                        disabled, onSelect: () => onToggle(key),
                    })),
                },
                {
                    key: "danger",
                    items: [
                        { key: "report", label: labels.report, icon: <Icon name="flag" />, disabled, onSelect: onReport },
                        {
                            key: "delete", label: labels.delete, icon: <Icon name="trash" />, tone: "danger" as const, disabled,
                            onSelect: onDelete,
                        },
                    ],
                },
            ]}
        />

    );

}
