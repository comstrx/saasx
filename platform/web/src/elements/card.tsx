import type { ReactNode } from "react";

type Props = { children: ReactNode; href?: string | undefined };

export default function Card ({ children, href }: Props) {
    return href ? <a className="card" href={href}>{children}</a> : <article className="card">{children}</article>;
}
