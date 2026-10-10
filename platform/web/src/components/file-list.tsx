"use client";

import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { type FileItem, fileSize } from "@/lib/std/files";

type Props = { items: readonly FileItem[]; label: string; pending?: boolean };

export default function FileList ({ items, label, pending }: Props) {

    const t = useTranslations("orderFiles");
    const locale = useLocale();

    return (

        <Stack role="list" aria-label={label} gap={5}>

            {items.map(( item, index ) => <Stack key={item.key} role="listitem" direction="responsive" gap={3}>

                <Stack direction="row" gap={3} grow>

                    <Icon name="file" size="md" tone="muted" />
                    <Stack gap={1} grow>

                        <Text size="small" weight="semibold" wrap="anywhere" dir="auto">
                            {item.name || t("unnamed", { number: index + 1 })}
                        </Text>
                        {fileSize(item.bytes, locale) ? <Text size="label" tone="muted">{fileSize(item.bytes, locale)}</Text> : null}
                        {!item.href ? <Text size="small" tone="muted">{t(pending ? "loadingLink" : "unavailable")}</Text> : null}

                    </Stack>

                </Stack>
                {item.href ? <Link
                    href={item.href} variant="outlined" target="_blank" rel="noopener noreferrer"
                    aria-label={t("openNamed", { name: item.name || t("unnamed", { number: index + 1 }) })}
                >{t("open")}<Icon name="external" size="sm" /></Link> : null}

            </Stack>)}

        </Stack>

    );

}
