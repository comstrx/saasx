import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type Pane = { key: string; active: boolean; children: ReactNode };

const styles = StyleSheet.create({
    panes: { flex: 1 },
    pane: { ...StyleSheet.absoluteFill },
    away: { transform: [{ translateX: 100000 }] },
});

export default function Panes ({ panes }: { panes: readonly Pane[] }) {

    return (

        <View style={styles.panes}>

            {panes.map(( pane ) => (

                <View
                    key={pane.key}
                    collapsable={false}
                    style={[styles.pane, !pane.active && styles.away]}
                    pointerEvents={pane.active ? "auto" : "none"}
                    importantForAccessibility={pane.active ? "auto" : "no-hide-descendants"}
                >

                    {pane.children}

                </View>

            ))}

        </View>

    );

}
