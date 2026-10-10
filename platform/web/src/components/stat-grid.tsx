import Grid from "@/elements/grid";
import { isIconName } from "@/icons/icon";
import StatTile from "./stat-tile";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Item = { key: string; label: string; value: string; icon: string; tone: Tone; caption?: string | null };
type Props = { label: string; items: readonly Item[] };

export default function StatGrid ({ label, items }: Props) {

    if ( !items.length ) return null;

    return (

        <Grid as="ul" columns="stats" gap={4} label={label}>

            {items.map(( item ) => (

                <StatTile
                    key={item.key} label={item.label} value={item.value} icon={isIconName(item.icon) ? item.icon : "info"} tone={item.tone}
                    caption={item.caption}
                />

            ))}

        </Grid>

    );

}
