import type { ReactNode } from "react";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import ChipTabs from "./chip-tabs";

type Props = {
    label: string; current: string; tabs: readonly { value: string; label: string; href: string }[];
    note?: { title: string; body: string }; children: ReactNode;
};

export default function TabbedSection ({ label, current, tabs, note, children }: Props) {

    return (

        <Stack gap={6}>

            <ChipTabs label={label} current={current} tabs={tabs} />

            {children}

            {note ? (

                <Surface tone="track" elevation="none" padding={5} radius="md">

                    <Stack direction="row" gap={3}>

                        <Icon name="info" tone="accent" />

                        <Stack gap={1}>

                            <Text weight="semibold">{note.title}</Text>

                            <Text size="small" tone="muted">{note.body}</Text>

                        </Stack>

                    </Stack>

                </Surface>

            ) : null}

        </Stack>

    );

}
