import { useCallback, useRef, useState } from "react";
import { FlatList, useWindowDimensions, View, type ViewToken } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { StoryScene } from "@/components/story-scene";
import { AppBar } from "@/elements/app-bar";
import type { Artwork } from "@/elements/art";
import { Button } from "@/elements/button";
import { Dots } from "@/elements/dots";
import { arrowBack, arrowNext } from "@/elements/icon";
import { Appear } from "@/elements/motion";
import { Round } from "@/elements/round";
import { Screen } from "@/elements/screen";
import { Text } from "@/elements/text";
import { composition } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

export type StoryPage = { key: string; figure: Artwork; title: string; body: string };

type StoryDeckProps = {
    pages: readonly StoryPage[];
    labels: { skip: string; next: string; back: string; finish: string };
    onFinish: () => void;
    active: boolean;
};

const visibility = { itemVisiblePercentThreshold: composition.story.visible };

export function StoryDeck ({ pages, labels, onFinish, active }: StoryDeckProps) {

    const theme = useTheme();
    const { width, height } = useWindowDimensions();
    const still = useReducedMotion();
    const pager = useRef<FlatList<StoryPage>>(null);
    const [ index, setIndex ] = useState(0);
    const side = Math.min(width * theme.composition.story.artShare, height * theme.composition.story.artHeightShare, theme.composition.story.artMax);
    const last = index === pages.length - 1;

    const settled = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        const shown = viewableItems[0];
        if ( typeof shown?.index === "number" ) setIndex(shown.index);
    }).current;

    const slide = ( next: number ) => {
        if ( next >= 0 && next < pages.length ) pager.current?.scrollToIndex({ index: next, animated: !still });
    };

    const render = useCallback(({ item, index: slot }: { item: StoryPage; index: number }) => (
        <View style={{ width, alignItems: "center", justifyContent: "center", gap: theme.space["8"], padding: theme.layout.gutter }}>
            <StoryScene figure={item.figure} size={side} active={active && index === slot} />
            <View style={{ alignSelf: "center", width: theme.composition.story.copyWidth, alignItems: "center", gap: theme.space["3"] }}>
                <Text rank="display" align="center" numberOfLines={3}>{item.title}</Text>
                <Text rank="description" ink="soft" align="center">{item.body}</Text>
            </View>
        </View>
    ), [ width, side, theme, active, index ]);

    return (
        <Screen padded={false}>
            <AppBar brand plain actions={<Button label={labels.skip} labelRank="label" size="slim" kind="soft" tint="neutral" block={false} onPress={onFinish} />} />
            <Appear from="still" style={{ flex: 1 }}>
                <FlatList
                    ref={pager}
                    data={pages}
                    keyExtractor={( item ) => item.key}
                    renderItem={render}
                    horizontal
                    pagingEnabled
                    initialNumToRender={1}
                    maxToRenderPerBatch={2}
                    windowSize={3}
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={settled}
                    viewabilityConfig={visibility}
                    getItemLayout={( _, slot ) => ({ length: width, offset: width * slot, index: slot })}
                    style={{ flex: 1 }}
                />
            </Appear>
            <View style={{ gap: theme.space["6"], paddingHorizontal: theme.layout.gutter, paddingBottom: theme.space["6"] }}>
                <Dots count={pages.length} index={index} />
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: theme.space["5"] }}>
                    {!last ? <Round raised icon={arrowBack} size={theme.control.lg.height} iconSize={theme.icon.lg} label={labels.back} disabled={index === 0} onPress={() => slide(index - 1)} /> : null}
                    {last
                        ? <Button label={labels.finish} size="lg" block={false} roomy onPress={onFinish} />
                        : <Round raised icon={arrowNext} size={theme.control.lg.height} iconSize={theme.icon.lg} look="solid" label={labels.next} onPress={() => slide(index + 1)} />}
                </View>
            </View>
        </Screen>
    );

}
