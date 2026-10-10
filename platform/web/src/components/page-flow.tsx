import type { ReactNode } from "react";
import Stack from "@/elements/stack";

type Props = { id?: string; gap?: 4 | 5 | 6 | 8 | 10 | 12 | 16; children: ReactNode };

export default function PageFlow ({ id, gap = 10, children }: Props) {

    return <Stack id={id} gap={gap}>{children}</Stack>;

}
