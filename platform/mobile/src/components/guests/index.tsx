import { Fragment } from "react";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Divider } from "@/elements/divider";
import type { IconName } from "@/elements/icon";
import { Plate } from "@/elements/plate";
import { Stepper } from "@/elements/stepper";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

export type GuestLine<K extends string> = {
    key: K;
    label: string;
    note?: string | undefined;
    icon?: IconName | undefined;
    min: number;
    max: number;
};

type GuestsProps<K extends string> = {
    party: Readonly<Record<K, number>>;
    lines: readonly GuestLine<K>[];
    onChange: ( key: K, next: number ) => void;
};

export function Guests<K extends string> ({ party, lines, onChange }: GuestsProps<K>) {

    const theme = useTheme();

    return (
        <Box>
            {lines.map(( line, index ) => (
                <Fragment key={line.key}>
                    {index > 0 ? <Divider /> : null}

                    <Box row align="center" gap="3" style={styles.row}>
                        {line.icon ? <Plate icon={line.icon} tone="brand" look="quiet" size={theme.control.sm.height} /> : null}

                        <Box gap="0" style={styles.copy}>
                            <Text rank="label">{line.label}</Text>
                            {line.note ? <Text rank="caption" ink="soft">{line.note}</Text> : null}
                        </Box>

                        <Stepper value={party[line.key]} min={line.min} max={line.max} label={line.label} onChange={( next ) => onChange(line.key, next) } />
                    </Box>
                </Fragment>
            ))}
        </Box>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    row: {
        minHeight: theme.control.lg.height + theme.space["6"],
        paddingVertical: theme.space["3"],
    },
    copy: {
        flex: 1,
    },

}));
