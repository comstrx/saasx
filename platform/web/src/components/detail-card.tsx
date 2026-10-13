import type { ReactNode } from "react";
import Badge from "@/elements/badge";
import Card from "@/elements/card";
import Facts from "@/elements/facts";
import Image from "@/elements/image";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

export type Detail = { name: string; image?: string | null | undefined; type?: string | null | undefined; price?: string | undefined; facts: readonly { key: string; label: string; value: string }[] };
type Props = { item: Detail; back?: { href: string; label: string } | undefined; actions?: ReactNode | undefined };

export default function DetailCard ({ item, back, actions }: Props) {
    return (

        <Card>

            <Stack gap={3}>

                <Image src={item.image} alt={item.name} />

                {item.type ? <Badge label={item.type} /> : null}

                {item.price ? <Text text={item.price} size="lg" /> : null}

                <Facts facts={item.facts} />

                {actions}

                {back ? <Link href={back.href} label={back.label} tone="primary" /> : null}

            </Stack>

        </Card>

    );
}
