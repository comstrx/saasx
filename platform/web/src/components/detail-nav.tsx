import Amount from "@/elements/amount";
import Link from "@/elements/link";
import SectionNav from "@/elements/section-nav";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import type { Money } from "@/lib/std/format";

type Props = {
    label: string;
    sections: readonly { id: string; label: string }[];
    price?: { from: string; now: Money; currencyLabel: string; unit?: string | null } | null;
    action?: { href: string; label: string } | null;
};

export default function DetailNav ({ label, sections, price, action }: Props) {

    return (

        <SectionNav
            label={label}
            sections={sections}
            end={

                <>

                    {price ? (

                        <Stack direction="row" align="baseline" gap={1}>

                            <Text as="span" size="label" tone="muted">{price.from}</Text>

                            <Amount {...price.now} currencyLabel={price.currencyLabel} size="title" />

                        </Stack>

                    ) : null}

                    {action ? <Link href={action.href} variant="filled" size="small">{action.label}</Link> : null}

                </>

            }
        />

    );

}
