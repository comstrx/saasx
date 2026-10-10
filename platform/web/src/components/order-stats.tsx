import Grid from "@/elements/grid";
import type { IconName } from "@/icons/icon";
import StatTile from "./stat-tile";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Item = { key: string; label: string; value: string | null; icon: IconName; tone: Tone };
type Props = { label: string; loading: boolean; items: readonly Item[] };

export default function OrderStats ({ label, loading, items }: Props) {

    return (

        <Grid as="ul" columns="stats" gap={4} label={label}>

            {items.map(( item ) => (

                <StatTile key={item.key} label={item.label} value={item.value} icon={item.icon} tone={item.tone} loading={loading} />

            ))}

        </Grid>

    );

}
