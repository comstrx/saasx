import Chip from "@/elements/chip";
import Link from "@/elements/link";
import Icon from "@/icons/icon";
import StateNotice from "./state-notice";

type Props = {
    art?: string;
    title: string;
    description: string;
    filters?: readonly { key: string; label: string; href: string; remove: string }[];
    clear?: { href: string; label: string } | null;
};

export default function EmptyResults ({ art, title, description, filters = [], clear }: Props) {

    return (

        <StateNotice
            art={art}
            title={title}
            description={description}
            chips={filters.length ? filters.map(( filter ) => (

                <Chip key={filter.key} href={filter.href} pressed label={filter.remove}>

                    {filter.label}

                    <Icon name="x" size="sm" weight="bold" />

                </Chip>

            )) : null}
            action={clear ? <Link href={clear.href} variant="outlined">{clear.label}</Link> : null}
        />

    );

}
