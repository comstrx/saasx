import { StyleSheet } from "react-native-unistyles";
import { Chip } from "@/elements/chip";
import { Scroll } from "@/elements/scroll";
import type { Sellable } from "@/model/detail";

type PicksProps = {
    items: readonly Sellable[];
    value: number | null;
    onChange: ( id: number ) => void;
};

export function Picks ({ items, value, onChange }: PicksProps) {

    return (
        <Scroll horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {items.map(( item ) => {

                const dead = item.soldOut || !item.fits;

                return (
                    <Chip
                        key={item.id}
                        label={item.name}
                        live={item.id === value}
                        onPress={dead ? undefined : () => onChange(item.id) }
                    />
                );

            })}
        </Scroll>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    rail: {
        gap: theme.space["2"],
    },

}));
