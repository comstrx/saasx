import type { ReactNode } from "react";
import Stack from "@/elements/stack";

type Props = { toolbar?: ReactNode | undefined; note?: ReactNode | undefined; pager?: ReactNode | undefined; children: ReactNode };

export default function TableFrame ({ toolbar, note, pager, children }: Props) {

    return (

        <Stack gap={3}>

            {toolbar}

            {note}

            {children}

            {pager}

        </Stack>

    );

}
