import { type ReactNode, ViewTransition } from "react";

type Props = { nav?: ReactNode; sidebar?: ReactNode; footer?: ReactNode; children: ReactNode; skip: string; page: string };

export default function Shell ({ nav, sidebar, footer, children, skip, page }: Props) {

    return (

        <div className="flex min-h-dvh flex-col">

            <a href="#content" className="skip-link">{skip}</a>

            {nav}

            <div className={sidebar ? "boxed shell-split" : "flex min-w-0 flex-1"}>

                {sidebar ? <aside className="shell-aside">{sidebar}</aside> : null}

                <main id="content" tabIndex={-1} className="page-main min-w-0 flex-1 outline-none">

                    <ViewTransition key={page} enter="page" exit="page" default="none">

                        <div className="min-w-0">{children}</div>

                    </ViewTransition>

                </main>

            </div>

            {footer}

        </div>

    );

}
