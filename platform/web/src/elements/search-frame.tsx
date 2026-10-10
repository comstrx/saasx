import type { FormEventHandler, ReactNode } from "react";

type Props = { label: string; children: ReactNode; onSubmit: FormEventHandler<HTMLFormElement>; pending?: boolean };

export default function SearchFrame ({ label, children, onSubmit, pending }: Props) {

    return (

        <search aria-label={label} className="min-w-0">

            <form aria-busy={pending || undefined} onSubmit={onSubmit} className="search-frame">

                {children}

            </form>

        </search>

    );

}
