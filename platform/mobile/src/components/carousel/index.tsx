import { Children, isValidElement, type ReactNode, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, { runOnJS, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { leadOf } from "@/elements/scroll/lead";
import { useTheme } from "@/theme/use-theme";

type CarouselProps = {
    children: ReactNode;
    slide: number;
    gap?: number | undefined;
    inset?: number | undefined;
};

export function Carousel ({ children, slide, gap, inset = 0 }: CarouselProps) {

    const theme = useTheme();
    const { width } = useWindowDimensions();
    const slides = Children.toArray(children).filter(isValidElement);
    const step = gap ?? theme.space["3"];
    const span = slide + step;
    const [ reach, setReach ] = useState(() => Math.ceil(width / span) + 1 );
    const drawn = useSharedValue(reach);

    const watch = useAnimatedScrollHandler(( event ) => {

        const due = Math.ceil(( leadOf(event) + width ) / span) + 1;

        if ( due <= drawn.value ) return;

        drawn.value = due;
        runOnJS(setReach)(due);

    });

    return (
        <Animated.ScrollView
            horizontal
            snapToInterval={span}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={watch}
            style={{ marginHorizontal: inset }}
            contentContainerStyle={{ gap: step }}
        >
            {slides.map(( pane, index ) => (
                <View key={pane.key ?? index} style={{ width: slide }}>{index < reach ? pane : null}</View>
            ))}
        </Animated.ScrollView>
    );

}
