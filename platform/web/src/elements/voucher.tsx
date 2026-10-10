import type { ReactNode } from "react";

type Props = { stub: ReactNode; children: ReactNode; tone?: "teal" | "ember"; inactive?: boolean };

export default function Voucher ({ stub, children, tone = "teal", inactive = false }: Props) {

    return (

        <article className="voucher" data-tone={tone} aria-disabled={inactive || undefined}>

            <div className="voucher-stub">{stub}</div>

            <div className="voucher-body">{children}</div>

        </article>

    );

}
