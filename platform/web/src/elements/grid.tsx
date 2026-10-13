import type { ReactNode } from "react";

type Entry = { key: string; node: ReactNode };
type Props = { columns: number; entries: readonly Entry[] };

export default function Grid ({ columns, entries }: Props) {

    return (

        <ul className="grid" data-columns={columns}>

            {entries.map(( entry ) => <li key={entry.key} className="grid-cell">{entry.node}</li>)}

        </ul>

    );

}
