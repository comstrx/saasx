import type { Route } from "next";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { Check as Tick } from "@/lib/providers/icons";

type Props = {
    href: string; label: string; checked: boolean; state: string; count?: string | null; shape?: "check" | "radio"; icon?: ReactNode;
};

export default function FacetOption ({ href, label, checked, state, count, shape = "check", icon }: Props) {

    return (

        <li className="facet-item">

            <NextLink href={href as Route} scroll={false} prefetch={false} className="facet-option" data-checked={checked || undefined}>

                <span aria-hidden="true" className={shape === "radio" ? "radio-dot" : "check-box"} data-checked={checked || undefined}>

                    {shape === "check" && checked ? <Tick weight="bold" /> : null}

                </span>

                {icon ? <span aria-hidden="true" className="facet-icon">{icon}</span> : null}

                <span className="facet-label" dir="auto">{label}</span>

                {checked ? <span className="sr-only">{state}</span> : null}

                {count ? <span className="facet-count">{count}</span> : null}

            </NextLink>

        </li>

    );

}
