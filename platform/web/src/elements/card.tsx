import type { Route } from "next";
import NextLink from "next/link";
import type { ReactNode } from "react";

type Props = { children: ReactNode; href?: string | undefined };

export default function Card ({ children, href }: Props) {

    if ( !href ) return <article className="card">{children}</article>;
    if ( !href.startsWith("/") ) return <a className="card" href={href}>{children}</a>;

    return <NextLink className="card" href={href as Route}>{children}</NextLink>;

}
