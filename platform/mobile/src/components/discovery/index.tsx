import { Fragment, type ReactNode, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { Band } from "@/components/band";
import { Carousel } from "@/components/carousel";
import { DiscoveryHero, type DiscoveryHeroProps } from "@/components/discovery/hero";
import { Promo, type PromoProps } from "@/components/promo";
import { Seek, type SeekProps } from "@/components/seek";
import { Loading } from "@/components/states";
import { Tile, type TileProps } from "@/components/tile";
import { TypeStrip, type TypeStripProps } from "@/components/type-strip";
import { AppBar } from "@/elements/app-bar";
import { Avatar } from "@/elements/avatar";
import { Appear, useEase } from "@/elements/motion";
import { Press } from "@/elements/press";
import { Round } from "@/elements/round";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Skeleton } from "@/elements/skeleton";
import { clamp } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

type ListingCard = TileProps & { key: string };
type OfferCard = PromoProps & { key: string };

type Section = {
    key: string;
    title: string;
    note?: string | undefined;
    action?: string | undefined;
    onAction?: (() => void) | undefined;
    loading: boolean;
} & ( { kind: "listings"; cards: readonly ListingCard[] } | { kind: "offers"; cards: readonly OfferCard[] } );

export type DiscoveryProps = {
    lead?: ReactNode | undefined;
    hero: DiscoveryHeroProps;
    search: SeekProps;
    types: TypeStripProps;
    settling: boolean;
    sections: readonly Section[];
    profile: {
        name: string;
        image?: string | undefined;
        label: string;
        alerts: string;
        count?: number | undefined;
        onPress: () => void;
        onAlerts: () => void;
    };
    refreshing: boolean;
    onRefresh: () => void;
    feedback?: ReactNode;
    children?: ReactNode;
};

export function Discovery ({ lead, hero, search, types, sections, profile, settling, refreshing, onRefresh, feedback, children }: DiscoveryProps) {

    const theme = useTheme();
    const { width } = useWindowDimensions();
    const [ head, setHead ] = useState(0);
    const [ pinned, setPinned ] = useState(false);
    const still = useReducedMotion();
    const ease = useEase([ "opacity", "transform" ]);
    const gutter = theme.layout.gutter;
    const inset = { paddingHorizontal: gutter };
    const listing = clamp(( width - gutter * 2 - theme.space["3"] ) / theme.composition.rail.visible, theme.composition.rail.min, theme.composition.rail.max);
    const offer = clamp(( width - gutter * 2 ) * theme.composition.offer.share, theme.composition.offer.min, theme.composition.offer.max);
    const shift = still ? 0 : theme.travel.near;
    const crest = { opacity: pinned ? 0 : 1, transform: [ { translateY: pinned ? -shift : 0 } ], ...ease };
    const pin = { opacity: pinned ? 1 : 0, transform: [ { translateY: pinned ? 0 : -shift } ], ...ease };
    const listings = sections.filter(( section ) => section.kind !== "offers" );
    const ordered = [ ...sections.filter(( section ) => section.kind === "offers" ), ...listings ];

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <Animated.View style={crest} pointerEvents={pinned ? "none" : "auto"}>
                <AppBar brand plain spacingAfter={theme.composition.discovery.gap} actions={
                    <>
                        <Round icon="bell" count={profile.count} onPress={profile.onAlerts} label={profile.alerts} />
                        <Press onPress={profile.onPress} sink="disc" accessibilityLabel={profile.label}>
                            <Avatar name={profile.name} source={profile.image} size={theme.control.bar.height} halo />
                        </Press>
                    </>
                } />
            </Animated.View>

            <Scroll docked refreshing={refreshing} onRefresh={onRefresh} mark={head} onMark={setPinned} contentContainerStyle={{ gap: theme.composition.discovery.gap }}>
                <View onLayout={( event ) => setHead(Math.round(event.nativeEvent.layout.y + event.nativeEvent.layout.height)) } style={inset}>
                    <Seek {...search} />
                </View>

                <View style={inset}>
                    {settling && types.types.length === 0
                        ? <Loading shape="types" rows={5} />
                        : <TypeStrip {...types} />}
                </View>

                {lead ? <View style={inset}>{lead}</View> : null}

                <View style={{ gap: theme.composition.discovery.section, marginTop: theme.composition.discovery.section - theme.composition.discovery.gap }}>
                    <Appear from="below" style={inset}><DiscoveryHero {...hero} /></Appear>

                    {ordered.map(( section ) => {
                        const span = section.kind === "offers" ? offer : listing;

                        return (
                            <Fragment key={section.key}>
                                <Appear from="below" travel={theme.travel.near}>
                                    <View style={{ gap: theme.composition.discovery.band }}>
                                        <View style={inset}>
                                            {settling
                                                ? <Skeleton width="56%" height={theme.text.section.latin.height} />
                                                : <Band minor title={section.title} note={section.note} action={section.action} onAction={section.onAction} />}
                                        </View>

                                        {section.loading ? <View style={inset}><Loading shape="rail" rows={2} span={span} /></View> : (
                                            <Carousel slide={span} inset={gutter} gap={theme.space["3"]}>
                                                {section.kind === "offers"
                                                    ? section.cards.map(({ key, ...card }) => <Promo key={key} {...card} width={span} /> )
                                                    : section.cards.map(({ key, ...card }) => <Tile key={key} {...card} width={span} /> )}
                                            </Carousel>
                                        )}
                                    </View>
                                </Appear>
                            </Fragment>
                        );
                    })}
                </View>

                {feedback}
            </Scroll>

            <Animated.View
                pointerEvents={pinned ? "box-none" : "none"}
                style={[ { position: "absolute", top: 0, insetInlineStart: 0, insetInlineEnd: 0, zIndex: theme.layer.sticky, backgroundColor: theme.plane.canvas }, pin ]}
            >
                <View style={{ ...inset, paddingTop: theme.space["2"], paddingBottom: theme.space["3"] }}><Seek {...search} /></View>
            </Animated.View>

            {children}
        </Screen>
    );

}
