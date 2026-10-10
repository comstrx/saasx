import Grid from "@/elements/grid";
import Tile from "@/elements/tile";
import Section from "./section";

type Item = { href: string; label: string; description: string; art: string | null; count: string | null };
type Props = { title: string; description?: string; items: readonly Item[] };

export default function VerticalGrid ({ title, description, items }: Props) {

    return (

        <Section title={title} description={description}>

            <Grid columns={5} mobileColumns={3} gap={3} label={title}>

                {items.map(( item ) => (

                    <Tile
                        key={item.href}
                        href={item.href}
                        title={item.label}
                        description={item.count ?? undefined}
                        art={item.art}
                        look="art"
                        size="large"
                    />

                ))}

            </Grid>

        </Section>

    );

}
