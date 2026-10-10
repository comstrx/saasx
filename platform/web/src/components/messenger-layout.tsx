import type { ReactNode } from "react";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";

type Props = { list: ReactNode; thread: ReactNode | null; placeholder: ReactNode };

export default function MessengerLayout ({ list, thread, placeholder }: Props) {

    return (

        <Surface padding={0} radius="lg" overflow="hidden">

            <Stack direction="wide" gap={0} align="stretch">

                <Stack visibility={thread ? "desktop" : "always"} fixed>

                    <Surface tone="clear" border={false} elevation="none" padding={4} radius="none" fill>{list}</Surface>

                </Stack>

                <Stack grow visibility={thread ? "always" : "desktop"}>

                    <Surface tone="clear" border="start" elevation="none" padding={5} radius="none" fill>{thread ?? placeholder}</Surface>

                </Stack>

            </Stack>

        </Surface>

    );

}
