import type { ReactNode } from "react";

export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {

    return (

        <header className="flex items-center justify-between gap-4 pb-6">

            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {actions}

        </header>

    );

}
