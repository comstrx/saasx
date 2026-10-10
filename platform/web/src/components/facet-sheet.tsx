"use client";

import { type ComponentProps, useState } from "react";
import Button from "@/elements/button";
import Counter from "@/elements/counter";
import Link from "@/elements/link";
import Sheet from "@/elements/sheet";
import Stack from "@/elements/stack";
import Icon from "@/icons/icon";
import FacetPanel from "./facet-panel";

type Props = {
    panel: ComponentProps<typeof FacetPanel>;
    labels: { label: string; count: number; show: string; close: string };
};

export default function FacetSheet ({ panel, labels }: Props) {

    const [open, setOpen] = useState(false);

    return (

        <Stack visibility="mobile">

            <Button variant="outlined" rounded="full" onClick={() => setOpen(true)} aria-haspopup="dialog">

                <Icon name="sliders" size="sm" />

                {labels.label}

                <Counter value={labels.count} tone="teal" />

            </Button>

            <Sheet
                open={open}
                onOpenChange={setOpen}
                title={labels.label}
                close={labels.close}
                footer={

                    <Stack direction="row" align="center" justify="between" gap={3} width="full">

                        {panel.clear ? <Link href={panel.clear.href} variant="text" scroll={false}>{panel.clear.label}</Link> : null}

                        <Button size="large" rounded="full" onClick={() => setOpen(false)}>{labels.show}</Button>

                    </Stack>

                }
            >

                <FacetPanel {...panel} heading={false} />

            </Sheet>

        </Stack>

    );

}
