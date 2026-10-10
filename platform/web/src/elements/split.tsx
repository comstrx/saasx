import type { ReactNode } from "react";

type Props = { children: ReactNode; aside: ReactNode; label: string; asideFirst?: boolean };

export default function Split ({ children, aside, label, asideFirst = false }: Props) {

    const summary = (
        <aside aria-label={label} className={asideFirst ? "detail-aside lg:col-start-2 lg:row-start-1" : "detail-aside"}>
            {aside}
        </aside>
    );

    return (

        <div className="detail-split">

            {asideFirst ? summary : null}

            <div className={asideFirst ? "detail-main lg:col-start-1 lg:row-start-1" : "detail-main"}>{children}</div>

            {!asideFirst ? summary : null}

        </div>

    );

}
