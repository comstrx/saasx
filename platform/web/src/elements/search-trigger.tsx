import { MagnifyingGlass } from "@/lib/providers/icons";

type Props = { label: string; placeholder: string; shortcut?: string; onClick: () => void };

export default function SearchTrigger ({ label, placeholder, shortcut, onClick }: Props) {

    return (

        <button type="button" aria-label={label} aria-haspopup="dialog" onClick={onClick} className="command-trigger max-lg:hidden">

            <MagnifyingGlass aria-hidden="true" />

            <span className="min-w-0 flex-1 truncate text-start">{placeholder}</span>

            {shortcut ? <kbd className="command-kbd" dir="ltr">{shortcut}</kbd> : null}

        </button>

    );

}
