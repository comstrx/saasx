import type { ReactNode } from "react";

type Props = { nav?: ReactNode; sidebar?: ReactNode; footer?: ReactNode; children: ReactNode; skip: string; page: string; scroll: boolean };

export default function Shell ({ nav, sidebar, footer, children, skip, page, scroll }: Props) {

    return (

        <div className="shell" data-page={page} data-scroll={scroll ? "" : undefined}>

            <a href="#content" className="shell-skip">{skip}</a>

            {nav ? <header className="shell-nav">{nav}</header> : null}

            <div className="shell-body" data-sidebar={sidebar ? "" : undefined}>

                {sidebar ? <aside className="shell-aside">{sidebar}</aside> : null}

                <main id="content" tabIndex={-1} className="shell-main">{children}</main>

            </div>

            {footer ? <footer className="shell-footer">{footer}</footer> : null}

        </div>

    );

}
