import DateTile from "@/elements/date-tile";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";

type Props = {
    month: string; day: string; weekday: string; label: string; place?: string | null; map?: { href: string; label: string } | null;
};

export default function EventDate ({ month, day, weekday, label, place, map }: Props) {

    return (

        <Surface padding={5} radius="lg">

            <Stack direction="row" align="center" gap={4}>

                <DateTile month={month} day={day} weekday={weekday} label={label} size="large" />

                <Stack gap={1} grow>

                    <Text weight="semibold">{label}</Text>

                    {place ? <Text size="small" tone="muted" dir="auto">{place}</Text> : null}

                </Stack>

                {map ? (

                    <Stack visibility="tablet" fixed>

                        <Link href={map.href} variant="outlined" size="medium" shape="pill" target="_blank" rel="noopener">

                            <Icon name="map" />

                            {map.label}

                        </Link>

                    </Stack>

                ) : null}

            </Stack>

        </Surface>

    );

}
