import type { ReactNode } from "react";

type Props = { brand: ReactNode; links: ReactNode; actions: ReactNode };

export default function Bar ({ brand, links, actions }: Props) {

    return (

        <nav className="bar" aria-label="primary">

            <div className="bar-brand">{brand}</div>

            <div className="bar-links">{links}</div>

            <div className="bar-actions">{actions}</div>

        </nav>

    );

}
