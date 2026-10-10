"use client";

import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useErrorSummary } from "@/hooks/use-error-summary";

type Props = { title: string; items: readonly { id: string; label: string; message: string }[] };

export default function ErrorSummary ({ title, items }: Props) {

    const focus = useErrorSummary();

    if ( !items.length ) return null;

    return (

        <Stack gap={2}>

            <Text weight="semibold" tone="danger">{title}</Text>
            <Stack gap={2} align="start">

                {items.map(( item ) => (

                    <Link
                        key={item.id} href={`#${item.id}`} variant="heading"
                        onClick={( event ) => { event.preventDefault(); focus(item.id); }}
                    >
                        {item.label}: {item.message}
                    </Link>

                ))}

            </Stack>

        </Stack>

    );

}
