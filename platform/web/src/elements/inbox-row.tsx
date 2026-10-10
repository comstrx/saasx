import type { Route } from "next";
import NextLink from "next/link";
import type { ReactNode } from "react";
import Check from "./check";

type Props = {
    title: string; body?: string | null; time?: string | null; icon: ReactNode; href?: string | null;
    unread?: boolean; marker?: ReactNode; actions?: ReactNode; framed?: boolean; busy?: string | null; onOpen?: () => void;
    select?: { id: string; label: string; checked: boolean; onChange: ( checked: boolean ) => void } | null;
};

export default function InboxRow ({
    title, body, time, icon, href, unread = false, marker, actions, framed = true, busy, onOpen, select,
}: Props) {

    return (

        <li className="inbox-row" data-unread={unread || undefined} aria-busy={busy ? true : undefined}>

            {select ? (

                <span className="inbox-select">

                    <Check id={select.id} label={select.label} labelVisible={false} checked={select.checked} onChange={select.onChange} />

                </span>

            ) : null}

            <span className={framed ? "inbox-icon" : "inbox-media"}>

                {icon}

                {unread ? <span aria-hidden="true" className="inbox-dot" /> : null}

            </span>

            <span className="inbox-body">

                <span className="inbox-head">

                    <span className="inbox-title" dir="auto">

                        {href ? (

                            <NextLink href={href as Route} prefetch={false} onClick={onOpen} className="inbox-link">{title}</NextLink>

                        ) : onOpen ? (

                            <button type="button" onClick={onOpen} className="inbox-link cursor-pointer text-start">{title}</button>

                        ) : title}

                    </span>

                    {marker}

                    {time ? <span className="inbox-time">{time}</span> : null}

                </span>

                {body ? <span className="inbox-text" dir="auto">{body}</span> : null}

            </span>

            {busy ? (

                <span role="status" className="inbox-actions inbox-busy">

                    <svg data-spinner="" aria-hidden="true" viewBox="0 0 24 24" className="spinner spinner-sm">

                        <circle cx="12" cy="12" r="10" />

                        <circle cx="12" cy="12" r="10" pathLength="100" />

                    </svg>

                    <span className="sr-only">{busy}</span>

                </span>

            ) : actions ? <span className="inbox-actions">{actions}</span> : null}

        </li>

    );

}
