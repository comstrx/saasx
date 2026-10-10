import type { ReactNode } from "react";

type Props = { children: ReactNode; band?: ReactNode; promises?: ReactNode; bottom?: ReactNode };

export default function Footer ({ children, band, promises, bottom }: Props) {

    return (

        <footer className="boxed site-footer">

            {band ? <div className="footer-band">{band}</div> : null}

            {children ? <div className="footer-main">{children}</div> : null}

            {promises ? <div className="footer-promises">{promises}</div> : null}

            {bottom ? <div className={children ? "footer-bottom" : "footer-bottom border-t-0"}>{bottom}</div> : null}

        </footer>

    );

}
