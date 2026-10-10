"use client";

import type { Data } from "@/api/features";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { localePath } from "@/lib/std/locale";
import { fillPattern } from "@/lib/std/route";
import FormSection from "./form-section";

type Props = { order: Data<"orders", "view">; path: string };

export default function OrderLines ({ order, path }: Props) {

    const t = useTranslations("orderFiles");
    const locale = useLocale();
    const lines = order.lines ?? [];
    const href = ( id: number ) => localePath(locale, fillPattern(path, { orderId: String(id) }), routing);

    if ( !order.parent_id && !lines.length ) return null;

    return (

        <FormSection title={t("relatedTitle")}>

            {order.parent_id ? <Link href={href(order.parent_id)} variant="outlined">{t("parent", { id: order.parent_id })}</Link> : null}
            {lines.length ? <Stack role="list" aria-label={t("relatedTitle")} gap={4}>

                {lines.map(( line ) => <Stack key={line.id} role="listitem" direction="responsive" justify="between" gap={2}>

                    <Stack gap={1} grow>

                        <Link href={href(line.id)} variant="heading">{line.catalog?.name || t("line", { id: line.id })}</Link>
                        {line.quantity ? <Text size="small" tone="muted">{t("quantity", { count: line.quantity })}</Text> : null}

                    </Stack>
                    <Link href={href(line.id)} variant="outlined" aria-label={t("openOrder", { id: line.id })}>{t("viewOrder")}</Link>

                </Stack>)}

            </Stack> : null}

        </FormSection>

    );

}
