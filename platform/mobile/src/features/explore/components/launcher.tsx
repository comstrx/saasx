import { router } from "expo-router";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutAnimation, Modal, ScrollView, View } from "react-native";
import Animated, { css, useReducedMotion } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { CalendarView, CalendarWeekdays } from "@/components/calendar";
import { Guests } from "@/components/guests";
import { Button } from "@/elements/button";
import { useBars } from "@/elements/hooks/use-bars";
import { useDebounced } from "@/elements/hooks/use-debounced";
import type { IconName } from "@/elements/icon";
import { useLabels } from "@/elements/labels";
import { Media } from "@/elements/media";
import { Appear, eases, glides, useEase } from "@/elements/motion";
import { Plate } from "@/elements/plate";
import { Press } from "@/elements/press";
import { Round } from "@/elements/round";
import { Row } from "@/elements/row";
import { Search } from "@/elements/search";
import { Surface } from "@/elements/surface";
import { Text } from "@/elements/text";
import { glyphOf } from "@/features/catalog/marks";
import { SearchKinds } from "@/features/explore/components/kinds";
import { usePartyLines } from "@/features/explore/components/party";
import { usePartyText } from "@/features/shell/copy";
import { type SearchHint, type SearchParty, seedOf } from "@/model/search";
import { useCategories } from "@/query/categories";
import { useSuggest } from "@/query/search";
import { addIsoDays, calendarMonths, type DateSpan, formatDateSpan, selectDateSpan, todayIso, weekdayLabels } from "@/std/date-range";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type Fold = "where" | "when" | "who";

type SearchLauncherProps = {
    open: boolean;
    kinds: readonly string[];
    type: string | null;
    ranged: ( type: string | null ) => boolean;
    onClose: () => void;
};

const marks: Readonly<Record<string, { icon: IconName; tone: ToneName }>> = {
    geo: { icon: "location", tone: "info" },
    category: { icon: "sections", tone: "accent" },
    catalog: { icon: "search", tone: "brand" },
};

const hues: readonly ToneName[] = [ "info", "accent", "success" ];

const fresh: SearchParty = { adults: 2, children: 0, rooms: 1 };

const ahead = 12;

const suggestions = 3;

function Card ({ label, value, title, open, onOpen, children }: { label: string; value: string; title: string; open: boolean; onOpen: () => void; children: ReactNode }) {

    const theme = useTheme();

    if ( !open ) return (
        <Press onPress={onOpen} feel="dim" accessibilityRole="button" accessibilityLabel={`${ label } ${ value }`} style={styles.shut}>
            <Text rank="label" ink="soft">{label}</Text>
            <Text rank="action" numberOfLines={1} style={styles.value}>{value}</Text>
        </Press>
    );

    return (
        <View style={styles.open}>
            <Appear from="below" travel={theme.travel.near}>
                <Text rank="heading">{title}</Text>
            </Appear>

            <Appear from="below" travel={theme.travel.near} delay={theme.beat.stagger}>
                <View style={styles.body}>{children}</View>
            </Appear>
        </View>
    );

}

export function SearchLauncher ({ open, kinds, type: chosen, ranged, onClose }: SearchLauncherProps) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const labels = useLabels();
    const still = useReducedMotion();
    const partyText = usePartyText();
    const [ mounted, setMounted ] = useState(open);
    const [ shown, setShown ] = useState(false);
    const [ leaving, setLeaving ] = useState(false);
    const [ fold, setFold ] = useState<Fold>("where");
    const [ type, setType ] = useState<string | null>(chosen);
    const [ term, setTerm ] = useState("");
    const [ place, setPlace ] = useState<SearchHint | null>(null);
    const [ span, setSpan ] = useState<DateSpan>({ start: null, end: null });
    const [ party, setParty ] = useState<SearchParty>(fresh);
    const typed = useDebounced(term, 260);
    const hints = useSuggest(!place && typed.trim().length > 1 ? typed : "");
    const sections = useCategories();
    const suggested = useMemo(
        () => [ ...( sections.data ?? [] ) ]
            .filter(( entry ) => entry.parent !== null && entry.catalogs > 0 && ( !type || entry.icon === type ) )
            .sort(( a, b ) => b.orders - a.orders || b.catalogs - a.catalogs )
            .slice(0, suggestions),
        [ sections.data, type ],
    );
    const lines = usePartyLines(party);
    const stay = ranged(type);
    const minimum = addIsoDays(todayIso(), 1);
    const months = useMemo(() => calendarMonths(i18n.language, minimum, ahead, minimum), [ i18n.language, minimum ]);
    const weekdays = useMemo(() => weekdayLabels(i18n.language), [ i18n.language ]);
    const exit = useEase([ "opacity", "transform" ], theme.beat.quick);
    const depth = theme.composition.launcher.drop;

    const veil = useMemo(() => css.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } }), []);
    const fall = useMemo(() => css.keyframes({
        from: { opacity: 0, transform: [ { translateY: -depth } ] },
        to: { opacity: 1, transform: [ { translateY: 0 } ] },
    }), [ depth ]);
    const rise = useMemo(() => css.keyframes({
        from: { opacity: 0, transform: [ { translateY: theme.travel.far } ] },
        to: { opacity: 1, transform: [ { translateY: 0 } ] },
    }), [ theme.travel.far ]);

    useBars(mounted, theme.name === "dark" ? "light" : "dark");

    useEffect(() => {

        if ( open ) {

            setType(chosen);
            setFold("where");
            setLeaving(false);
            setMounted(true);

            return;

        }

        setLeaving(true);

        const linger = setTimeout(() => {

            setShown(false);
            setMounted(false);

        }, theme.beat.quick + theme.beat.stagger);

        return () => clearTimeout(linger);

    }, [ open, chosen, theme.beat.quick, theme.beat.stagger ]);

    if ( !mounted ) return null;

    const arrive = ( name: typeof fall, order: number, glide: keyof typeof glides ) => still ? null : {
        animationName: name,
        animationDuration: glides[glide].duration,
        animationTimingFunction: glides[glide].easing,
        animationDelay: order * theme.beat.stagger * 2,
        animationFillMode: "backwards" as const,
    };

    const turn = ( next: Fold ) => {

        LayoutAnimation.configureNext(LayoutAnimation.create(theme.beat.calm, "easeInEaseOut", "opacity"));
        setFold(next);

    };

    const pick = ( hint: SearchHint ) => {

        if ( hint.kind === "catalog" ) {

            onClose();
            router.push(`/catalog/${ hint.id }`);

            return;

        }

        setPlace(hint);
        setTerm("");

        if ( stay ) turn("when");

    };

    const dirty = type !== chosen || term.trim() !== "" || place !== null || span.start !== null
        || party.adults !== fresh.adults || party.children !== fresh.children || party.rooms !== fresh.rooms;

    const clear = () => {

        setType(chosen);
        setTerm("");
        setPlace(null);
        setSpan({ start: null, end: null });
        setParty(fresh);
        turn("where");

    };

    const go = () => {

        const params = seedOf({ type, place, term, checkin: stay ? span.start : null, checkout: stay ? span.end : null, party });

        onClose();
        router.push({ pathname: "/explore", params });

    };

    const where = place?.label || term.trim() || t("search.anywhere");
    const when = span.start && span.end ? formatDateSpan(i18n.language, span) : t("search.addDates");
    const who = `${ partyText(party.adults, party.children) } · ${ t("search.guestsRooms", { count: party.rooms }) }`;
    const away = { opacity: leaving ? 0 : 1, transform: [ { translateY: leaving ? -theme.travel.far : 0 } ], ...exit, transitionTimingFunction: eases.exit };

    return (
        <Modal visible transparent animationType="none" statusBarTranslucent navigationBarTranslucent onShow={() => setShown(true) } onRequestClose={onClose}>
            {shown ? (
                <Animated.View style={[ styles.ground, still ? null : { animationName: veil, animationDuration: theme.beat.calm, animationTimingFunction: eases.standard }, { opacity: leaving ? 0 : 1 }, exit ]}>
                    <Surface value="canvas">
                        <Animated.View style={[ styles.fill, away ]}>
                            <Animated.View style={[ styles.top, arrive(fall, 0, "settle") ]}>
                                <View style={styles.fill}>
                                    <SearchKinds kinds={kinds.map(( key ) => ({ key, count: 0 }) )} chosen={type ? [ type ] : []} onPick={setType} />
                                </View>

                                <Round icon="close" onPress={onClose} label={labels.close} />
                            </Animated.View>

                            <ScrollView style={styles.fill} contentContainerStyle={styles.cards} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                                <Animated.View style={arrive(fall, 1, "bounce")}>
                                    <Card label={t("search.whereLabel")} value={where} title={t("search.whereTitle")} open={fold === "where"} onOpen={() => turn("where") }>
                                        <Search
                                            value={place ? place.label : term}
                                            onChangeText={( next ) => { setPlace(null); setTerm(next); }}
                                            onClear={() => { setPlace(null); setTerm(""); }}
                                            placeholder={t("search.findPlace")}
                                            returnKeyType="search"
                                            onSubmitEditing={go}
                                        />

                                        {!place && !term.trim() && suggested.length > 0 ? <Text rank="label" ink="soft">{t("search.suggested")}</Text> : null}

                                        <View style={styles.list}>
                                            {!place && !term.trim() ? suggested.map(( entry, index ) => (
                                                <Row
                                                    key={`section-${ entry.id }`}
                                                    figure={entry.image
                                                        ? <Media source={entry.image} icon="sections" ratio={1} curve="tile" style={styles.thumb} />
                                                        : <Plate icon={entry.icon ? glyphOf(entry.icon) : "sections"} tone={hues[index % hues.length] ?? "info"} look="soft" size={theme.control.md.height} />}
                                                    title={entry.name}
                                                    note={t("sections.holds", { count: entry.catalogs })}
                                                    onPress={() => pick({ id: entry.id, kind: "category", label: entry.name }) }
                                                />
                                            )) : null}

                                            {( hints.data ?? [] ).slice(0, 6).map(( hint ) => (
                                                <Row
                                                    key={`${ hint.kind }-${ hint.id }`}
                                                    figure={<Plate icon={marks[hint.kind]?.icon ?? "search"} tone={marks[hint.kind]?.tone ?? "brand"} look="soft" size={theme.control.md.height} />}
                                                    title={hint.label}
                                                    note={t(`search.hint.${ hint.kind }`, { defaultValue: t("search.hint.catalog") })}
                                                    onPress={() => pick(hint) }
                                                />
                                            ))}
                                        </View>
                                    </Card>
                                </Animated.View>

                                {stay ? (
                                    <Animated.View style={arrive(fall, 2, "bounce")}>
                                        <Card label={t("search.whenLabel")} value={when} title={t("search.whenTitle")} open={fold === "when"} onOpen={() => turn("when") }>
                                            <CalendarWeekdays weekdays={weekdays} />

                                            <ScrollView nestedScrollEnabled style={styles.calendar} showsVerticalScrollIndicator={false}>
                                                <CalendarView months={months} value={span} onSelect={( iso ) => setSpan(( current ) => selectDateSpan(current, iso) )} />
                                            </ScrollView>
                                        </Card>
                                    </Animated.View>
                                ) : null}

                                {stay ? (
                                    <Animated.View style={arrive(fall, 3, "bounce")}>
                                        <Card label={t("search.whoLabel")} value={who} title={t("search.whoTitle")} open={fold === "who"} onOpen={() => turn("who") }>
                                            <Guests party={party} lines={lines} onChange={( key, next ) => setParty(( current ) => ({ ...current, [key]: next }) )} />
                                        </Card>
                                    </Animated.View>
                                ) : null}
                            </ScrollView>

                            <Animated.View style={[ styles.foot, arrive(rise, 3, "settle") ]}>
                                {dirty ? (
                                    <Appear from="still" grow>
                                        <Button label={t("search.clearAll")} kind="soft" tint="neutral" block={false} onPress={clear} />
                                    </Appear>
                                ) : <View />}

                                <Button label={t("search.title")} icon="search" block={false} roomy onPress={go} />
                            </Animated.View>
                        </Animated.View>
                    </Surface>
                </Animated.View>
            ) : null}
        </Modal>
    );

}

const styles = StyleSheet.create(( theme, runtime ) => ({

    ground: {
        flex: 1,
        paddingTop: runtime.insets.top,
        paddingBottom: runtime.insets.bottom,
        backgroundColor: theme.plane.canvas,
    },
    top: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        paddingHorizontal: theme.layout.gutter,
        paddingTop: theme.space["2"],
        paddingBottom: theme.space["4"],
    },
    fill: {
        flex: 1,
    },
    cards: {
        gap: theme.layout.stack,
        paddingHorizontal: theme.layout.gutter,
        paddingBottom: theme.space["4"],
    },
    shut: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: theme.space["3"],
        minHeight: theme.composition.row.line + theme.space["2.5"],
        paddingHorizontal: theme.space["5"],
        borderRadius: theme.radius.panel,
        backgroundColor: theme.plane.base,
    },
    value: {
        flexShrink: 1,
    },
    open: {
        gap: theme.space["4"],
        padding: theme.space["5"],
        borderRadius: theme.radius.panel,
        backgroundColor: theme.plane.base,
    },
    body: {
        gap: theme.space["3"],
    },
    list: {
        marginHorizontal: -theme.composition.row.pad,
    },
    thumb: {
        width: theme.control.md.height,
    },
    calendar: {
        maxHeight: theme.composition.launcher.calendar,
    },
    foot: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: theme.space["4"],
        paddingHorizontal: theme.layout.gutter,
        paddingVertical: theme.space["3"],
    },

}));
