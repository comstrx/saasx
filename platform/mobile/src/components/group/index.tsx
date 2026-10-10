import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { View } from "react-native";
import { Box } from "@/elements/box";
import { Appear } from "@/elements/motion";
import { Seam } from "@/elements/row";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

type GroupProps = {
    children: ReactNode;
    title?: string | undefined;
    note?: string | undefined;
    staggered?: boolean | undefined;
};

export function Group ({ children, title, note, staggered = false }: GroupProps) {

    const theme = useTheme();
    const rows = Children.toArray(children).filter(isValidElement);
    const group = theme.composition.group;

    return (
        <View>
            <Box plane="base" curve="panel" clip>
                {title ? (
                    <Text
                        rank="action"
                        color={theme.tone.brand.onSoft}
                        style={{ paddingTop: group.headTop, paddingHorizontal: theme.composition.row.pad }}
                    >
                        {title}
                    </Text>
                ) : null}

                {rows.map(( row, index ) => (
                    <Fragment key={row.key ?? index}>
                        <Seam value={index > 0}>
                            {staggered
                                ? <Appear from="below" delay={Math.min(index, theme.beat.cap) * theme.beat.stagger} travel={theme.travel.near}>{row}</Appear>
                                : row}
                        </Seam>
                    </Fragment>
                ))}
            </Box>

            {note ? (
                <Text rank="caption" ink="faint" style={{ paddingHorizontal: group.notePad, paddingTop: group.noteTop }}>
                    {note}
                </Text>
            ) : null}
        </View>
    );

}
