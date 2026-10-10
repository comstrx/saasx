"use client";

import type { ComponentProps } from "react";
import Scroller from "@/elements/scroller";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Props = Omit<ComponentProps<typeof Scroller>, "arrows">;

export default function ScrollRow ( props: Props ) {

    const t = useTranslations("common");

    return (

        <Scroller
            {...props}
            arrows={{
                start: <Icon name="caret-start" weight="bold" />,
                end: <Icon name="caret-end" weight="bold" />,
                previous: t("scrollBack"),
                next: t("scrollForward"),
            }}
        />

    );

}
