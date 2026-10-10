"use client";

import Menu from "@/elements/menu";
import Icon from "@/icons/icon";

type Props = {
    label: string;
    choices: readonly { key: string; label: string; href: string; current: boolean }[];
};

export default function SortMenu ({ label, choices }: Props) {

    return (

        <Menu
            label={label}
            look="chip"
            width="small"
            trigger={<><Icon name="sort" size="sm" />{label}</>}
            sections={[{
                key: "sorts",
                items: choices.map(( choice ) => ({
                    key: choice.key,
                    href: choice.href,
                    label: choice.label,
                    current: choice.current,
                    icon: choice.current ? <Icon name="check" weight="bold" /> : <Icon name="sort" />,
                })),
            }]}
        />

    );

}
