import Card from "@/elements/card";
import Flag from "@/elements/flag";
import Grid from "@/elements/grid";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Media from "@/elements/media";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import Section from "./section";

type Region = { key: string; label: string; href: string | null };
type Country = {
    key: string; title: string; code: string | null; count: string; image: string | null; href: string | null; regions: readonly Region[];
};
type Props = { title: string; description?: string; items: readonly Country[] };

export default function CountryAtlas ({ title, description, items }: Props) {

    if ( !items.length ) return null;

    return (

        <Section title={title} description={description}>

            <Grid columns={3} gap={5} label={title}>

                {items.map(( country ) => (

                    <Card
                        key={country.key}
                        media={<Media src={country.image} alt="" ratio="wide" />}
                        footer={country.regions.length ? (

                            <Stack direction="row" gap={2} wrap>

                                {country.regions.map(( region ) => region.href ? (

                                    <Link key={region.key} href={region.href} variant="chip">

                                        <Icon name="pin" size="sm" tone="accent" />

                                        {region.label}

                                    </Link>

                                ) : null)}

                            </Stack>

                        ) : undefined}
                    >

                        <Stack direction="row" gap={3} align="center">

                            {country.code ? <Flag code={country.code} size="medium" /> : null}

                            <Stack gap={0}>

                                <Heading level={3} size="title">

                                    {country.href ? (

                                        <Link href={country.href} variant="heading" dir="auto">{country.title}</Link>

                                    ) : country.title}

                                </Heading>

                                <Text size="small" tone="muted">{country.count}</Text>

                            </Stack>

                        </Stack>

                    </Card>

                ))}

            </Grid>

        </Section>

    );

}
