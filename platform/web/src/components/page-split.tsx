import type { ReactNode } from "react";
import Columns from "@/elements/columns";
import Stack from "@/elements/stack";

type Props = {
    id?: string;
    ratio?: "3:1" | "2:1" | "1:1";
    start: ReactNode;
    end: ReactNode;
    label?: string;
    sticky?: boolean;
};

export default function PageSplit ({ id, ratio = "2:1", start, end, label, sticky }: Props) {

    return (

        <Stack id={id}>

            <Columns ratio={ratio} gap={8} start={start} end={end} label={label} sticky={sticky} />

        </Stack>

    );

}
