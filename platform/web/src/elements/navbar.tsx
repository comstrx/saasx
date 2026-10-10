import type { ReactNode } from "react";

type Props = { label: string; brand: ReactNode; links: ReactNode; actions: ReactNode; mobile?: ReactNode };

export default function Navbar ({ label, brand, links, actions, mobile }: Props) {

    return (

        <header className="nav-shell">

            <div className="boxed nav-bar">

                <div className="flex shrink-0 items-center">{brand}</div>

                <nav aria-label={label} className="nav-links">{links}</nav>

                <div className="ms-auto flex min-w-0 items-center gap-1.5 sm:gap-2">

                    {actions}

                    {mobile ? <div className="xl:hidden">{mobile}</div> : null}

                </div>

            </div>

        </header>

    );

}
