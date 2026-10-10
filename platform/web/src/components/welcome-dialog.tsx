"use client";

import Art from "@/elements/art";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Emblem from "@/elements/emblem";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useWelcomeDialog } from "@/hooks/use-welcome-dialog";
import Icon, { isIconName } from "@/icons/icon";

type Props = {
    art: string; title: string; body: string; start: string; later: string; close: string;
    benefits: readonly { icon: string; text: string }[];
};

export default function WelcomeDialog ({ art, title, body, start, later, close, benefits }: Props) {

    const welcome = useWelcomeDialog();

    return (

        <Dialog
            open={welcome.open}
            onOpenChange={welcome.change}
            title={title}
            description={body}
            close={close}
            size="small"
            hero={<Art src={art} size="medium" motion="float" glow />}
        >

            <Stack gap={6}>

                {benefits.length ? (

                    <Stack as="ul" gap={3}>

                        {benefits.map(( benefit ) => (

                            <Stack as="li" key={benefit.text} direction="row" align="center" gap={3}>

                                <Emblem size="small">{isIconName(benefit.icon) ? <Icon name={benefit.icon} weight="fill" /> : null}</Emblem>

                                <Text as="span" size="value" weight="medium">{benefit.text}</Text>

                            </Stack>

                        ))}

                    </Stack>

                ) : null}

                <Stack gap={2}>

                    <Button size="large" width="full" onClick={welcome.dismiss}>{start}</Button>

                    <Button variant="ghost" width="full" onClick={welcome.dismiss}>{later}</Button>

                </Stack>

            </Stack>

        </Dialog>

    );

}
