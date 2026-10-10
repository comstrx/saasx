import { Children, isValidElement, type ReactNode } from "react";
import { type StyleProp, View, type ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Button } from "@/elements/button";
import { Surface } from "@/elements/surface";

type DockProps = {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    inline?: boolean | undefined;
};

export function Dock ({ children, style, inline = false }: DockProps) {

    const lone = Children.toArray(children).filter(isValidElement);

    const bare = lone.length === 1 && lone[0]?.type === Button;

    if ( bare ) return (
        <View pointerEvents="box-none" style={inline ? styles.flat : styles.float}>
            <View style={[ styles.lift, style ]}>{children}</View>
        </View>
    );

    if ( inline ) return <View style={[ styles.flat, style ]}>{children}</View>;

    return (
        <View pointerEvents="box-none" style={styles.float}>
            <View style={[ styles.pill, style ]}>
                <Surface value="base">{children}</Surface>
            </View>
        </View>
    );

}

const styles = StyleSheet.create(( theme, runtime ) => ({

    float: {
        position: "absolute",
        insetInlineStart: theme.layout.dockInset,
        insetInlineEnd: theme.layout.dockInset,
        bottom: runtime.insets.bottom + theme.layout.dockBottom,
        zIndex: theme.layer.sticky,
    },
    pill: {
        paddingHorizontal: theme.space["4"],
        paddingVertical: ( theme.layout.floatHeight - theme.control.md.height ) / 2,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.plane.base,
        ...theme.depth.float,
        borderWidth: theme.stroke.thin,
        borderColor: theme.line.soft,
    },
    lift: {
        borderRadius: theme.radius.pill,
        boxShadow: theme.depth.float.boxShadow,
    },
    flat: {
        paddingHorizontal: theme.layout.gutter,
        paddingTop: theme.space["3"],
        paddingBottom: runtime.insets.bottom + theme.space["3"],
    },

}));
