import Emblem from "@/elements/emblem";
import Grid from "@/elements/grid";
import Tile from "@/elements/tile";
import Icon, { isIconName } from "@/icons/icon";
import Section from "./section";

type Item = { key: string; title: string; description?: string; icon: string; href: string | null };

const tones = ["teal", "blue", "ember", "green", "amber"] as const;
type Props = { title: string; description?: string; items: readonly Item[]; action?: { href: string; label: string } };

export default function CategoryGrid ({ title, description, items, action }: Props) {

    return (

        <Section title={title} description={description} action={action}>

            <Grid columns={4} mobileColumns={1} gap={3} label={title}>

                {items.map(( item, index ) => (

                    <Tile
                        key={item.key}
                        href={item.href ?? "#"}
                        title={item.title}
                        description={item.description}
                        look="panel"
                        size="large"
                        icon={(

                            <Emblem tone={tones[index % tones.length]} size="large">

                                <Icon name={isIconName(item.icon) ? item.icon : "compass"} />

                            </Emblem>

                        )}
                    />

                ))}

            </Grid>

        </Section>

    );

}
