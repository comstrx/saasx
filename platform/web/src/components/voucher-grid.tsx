import type { ReactNode } from "react";
import Grid from "@/elements/grid";

type Props = { label: string; children: ReactNode };

export default function VoucherGrid ({ label, children }: Props) {

    return <Grid as="div" columns={2} gap={4} label={label}>{children}</Grid>;

}
