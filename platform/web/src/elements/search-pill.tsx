import { MagnifyingGlass } from "@/lib/providers/icons";

type Props = { label: string; parts: readonly { key: string; text: string; strong?: boolean }[]; onOpen: () => void };

export default function SearchPill ({ label, parts, onOpen }: Props) {

    const [lead, ...rest] = parts;

    return (

        <button type="button" aria-label={label} onClick={onOpen} className="search-pill">

            <span className="search-pill-parts">

                {lead ? <span className="search-pill-lead" dir="auto">{lead.text}</span> : null}

                {rest.length ? <span className="search-pill-rest">{rest.map(( part ) => part.text).join(" · ")}</span> : null}

            </span>

            <span aria-hidden="true" className="search-pill-action"><MagnifyingGlass weight="bold" /></span>

        </button>

    );

}
