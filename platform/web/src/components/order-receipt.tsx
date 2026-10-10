"use client";

import Art from "@/elements/art";
import Button from "@/elements/button";
import Emblem from "@/elements/emblem";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Text from "@/elements/text";
import Icon from "@/icons/icon";

type Props = {
    title: string; description: string; reference: string; href: string; label: string; art?: string;
    tone?: "positive" | "attention";
    payment?: { href: string; label: string };
    again?: { label: string; onClick: () => void };
};

export default function OrderReceipt ({ title, description, reference, href, label, art, tone = "positive", payment, again }: Props) {

    return (

        <Stack gap={6} role="status" align="center">

            {art ? <Art src={art} size="large" glow /> : (

                <Emblem size="large" shape="round" tone={tone === "positive" ? "teal" : "ember"}>

                    <Icon name={tone === "positive" ? "check" : "warning"} />

                </Emblem>

            )}

            <Stack gap={2} align="center">

                <Heading size="h2" align="center">{title}</Heading>

                <Text tone="muted" align="center" measure="short" wrap="pretty">{description}</Text>

            </Stack>

            <Status tone={tone} icon={<Icon name="receipt" size="sm" />}>{`\u2066${reference}\u2069`}</Status>

            <Stack gap={3} width="full">

                {payment ? <Link
                    href={payment.href} variant="filled" size="large" width="full"
                    onClick={() => window.history.replaceState(null, "", href)}
                ><Icon name="card" />{payment.label}</Link> : null}

                <Link href={href} variant={payment ? "outlined" : "filled"} size="large" width="full">{label}</Link>

                {again ? <Button variant="ghost" width="full" onClick={again.onClick}>{again.label}</Button> : null}

            </Stack>

        </Stack>

    );

}
