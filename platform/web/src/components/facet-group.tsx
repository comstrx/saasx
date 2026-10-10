"use client";

import { useState } from "react";
import Button from "@/elements/button";
import FacetOption from "@/elements/facet-option";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Icon, { isIconName } from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Option = { key: string; label: string; count: string | null; href: string; checked: boolean; icon?: string | null };
type Props = { title: string; shape: "check" | "radio"; state: string; options: readonly Option[]; limit?: number };

export default function FacetGroup ({ title, shape, state, options, limit = 6 }: Props) {

    const t = useTranslations("facets");
    const [open, setOpen] = useState(false);
    const hidden = Math.max(0, options.length - limit);
    const shown = open || !hidden ? options : options.slice(0, limit);

    return (

        <Stack gap={2}>

            <Heading level={3} size="label" tone="muted">{title}</Heading>

            <Stack as="ul" gap={0}>

                {shown.map(( option ) => (

                    <FacetOption
                        key={option.key}
                        href={option.href}
                        label={option.label}
                        count={option.count}
                        checked={option.checked}
                        state={state}
                        shape={shape}
                        icon={isIconName(option.icon) ? <Icon name={option.icon} weight={option.checked ? "fill" : "regular"} /> : null}
                    />

                ))}

            </Stack>

            {hidden ? (

                <Stack direction="row">

                    <Button variant="link" size="small" onClick={() => setOpen(( value ) => !value)} aria-expanded={open}>

                        {open ? t("less") : t("more", { count: hidden })}

                        <Icon name={open ? "caret-up" : "caret-down"} size="sm" weight="bold" />

                    </Button>

                </Stack>

            ) : null}

        </Stack>

    );

}
