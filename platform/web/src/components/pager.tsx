import Link from "@/elements/link";
import Pagination from "@/elements/pagination";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon from "@/icons/icon";

type Numbers = {
    label: string; page: number; pages: number; previous: string; next: string;
    href: ( page: number ) => string; pageLabel: ( page: number ) => string;
};
type Props = {
    label: string;
    previous?: { label: string; href: string } | null;
    next?: { label: string; href: string } | null;
    numbers?: Numbers | null;
};

export default function Pager ({ label, previous, next, numbers }: Props) {

    if ( numbers && numbers.pages > 1 ) return (

        <Stack direction="responsive" justify="between" align="center" gap={4}>

            <Text size="small" tone="muted" role="status">{label}</Text>

            <Pagination {...numbers} />

        </Stack>

    );

    return (

        <Stack direction="responsive" justify="between" align="center" gap={4}>

            <Text size="small" tone="muted" role="status">{label}</Text>

            <Stack direction="row" gap={2}>

                {previous ? (

                    <Link href={previous.href} variant="outlined" size="medium">

                        <Icon name="caret-start" weight="bold" />

                        {previous.label}

                    </Link>

                ) : null}

                {next ? (

                    <Link href={next.href} variant="outlined" size="medium">

                        {next.label}

                        <Icon name="caret-end" weight="bold" />

                    </Link>

                ) : null}

            </Stack>

        </Stack>

    );

}
