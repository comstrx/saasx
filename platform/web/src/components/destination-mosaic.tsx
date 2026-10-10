import Badge from "@/elements/badge";
import Cover from "@/elements/cover";
import Grid from "@/elements/grid";
import Icon from "@/icons/icon";
import Section from "./section";

type Spot = {
    key: string;
    title: string;
    subtitle: string;
    count: string;
    image: string | null;
    variants: Record<string, string | null> | null;
    href: string | null;
};
type Props = { title: string; description?: string; items: readonly Spot[]; action?: { href: string; label: string } };

export default function DestinationMosaic ({ title, description, items, action }: Props) {

    return (

        <Section title={title} description={description} action={action}>

            <Grid columns="mosaic" gap={4} label={title}>

                {items.map(( spot, index ) => (

                    <Cover
                        key={spot.key}
                        href={spot.href}
                        image={spot.image}
                        variants={spot.variants}
                        title={spot.title}
                        subtitle={spot.subtitle}
                        size={index === 0 ? "large" : "small"}
                        meta={<Badge tone="neutral"><Icon name="pin" weight="fill" tone="accent" />{spot.count}</Badge>}
                    />

                ))}

            </Grid>

        </Section>

    );

}
