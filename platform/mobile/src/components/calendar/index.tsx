import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Divider } from "@/elements/divider";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { type CalendarMonth, type DateSpan, inDateSpan } from "@/std/date-range";

type CalendarViewProps = {
    months: readonly CalendarMonth[];
    weekdays?: readonly string[] | undefined;
    value: DateSpan;
    onSelect: ( iso: string ) => void;
    closed?: (( iso: string ) => boolean) | undefined;
    note?: (( iso: string ) => string) | undefined;
};

export function CalendarWeekdays ({ weekdays }: { weekdays: readonly string[] }) {

    return (
        <View style={styles.rail}>
            <View style={styles.weekdays}>
                {weekdays.map(( label ) => (
                    <View key={label} style={styles.head}>
                        <Text rank="label" ink="soft" align="center" numberOfLines={1}>{label}</Text>
                    </View>
                ))}
            </View>

            <Divider strong />
        </View>
    );

}

export function CalendarView ({ months, weekdays, value, onSelect, closed, note }: CalendarViewProps) {

    const noted = Boolean(note);

    styles.useVariants({ noted });

    return (
        <View>
            {weekdays ? <CalendarWeekdays weekdays={weekdays} /> : null}

            {months.map(( month ) => (
                <View key={month.key} style={styles.month}>
                    <Text rank="label" style={styles.title}>{month.title}</Text>

                    <View style={styles.grid}>
                        {month.days.map(( day ) => {

                            if ( !day.inMonth ) return <View key={day.iso} style={styles.slot} />;

                            const head = day.iso === value.start;
                            const tail = day.iso === value.end;
                            const blocked = day.disabled || Boolean(closed?.(day.iso));
                            const endpoint = ( head || tail ) && !blocked;
                            const inside = inDateSpan(day.iso, value);
                            const spanned = !blocked && ( inside || endpoint ) && Boolean(value.start && value.end);
                            const label = blocked ? "" : note?.(day.iso) ?? "";

                            return (
                                <View key={day.iso} style={styles.slot}>
                                    {spanned ? (
                                        <View
                                            style={[
                                                styles.trail,
                                                head ? styles.trailHead : null,
                                                tail ? styles.trailTail : null,
                                            ]}
                                            pointerEvents="none"
                                        />
                                    ) : null}

                                    <Press
                                        style={[ styles.day, endpoint ? styles.endpoint : null ]}
                                        onPress={() => onSelect(day.iso) }
                                        disabled={blocked}
                                        sink="disc"
                                        accessibilityRole="button"
                                        accessibilityLabel={day.iso}
                                        accessibilityState={{ selected: endpoint, disabled: blocked }}
                                    >
                                        <Text
                                            rank="title"
                                            ink={blocked ? "faint" : "base"}
                                            tint={endpoint ? "on" : undefined}
                                            align="center"
                                            numberOfLines={1}
                                            ltr
                                            style={blocked ? styles.unavailable : null}
                                        >
                                            {day.day}
                                        </Text>

                                        {noted ? (
                                            <Text
                                                rank="micro"
                                                ink="faint"
                                                tint={endpoint ? "on" : undefined}
                                                align="center"
                                                numberOfLines={1}
                                                ltr
                                                style={styles.tag}
                                            >
                                                {label}
                                            </Text>
                                        ) : null}
                                    </Press>
                                </View>
                            );

                        })}
                    </View>
                </View>
            ))}
        </View>
    );

}

const column = "14.2857%";

const styles = StyleSheet.create(( theme ) => ({

    rail: {
        marginBottom: theme.space["1"],
    },
    weekdays: {
        flexDirection: "row",
        paddingBottom: theme.space["3"],
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        rowGap: theme.space["1"],
    },
    month: {
        paddingTop: theme.space["5"],
    },
    title: {
        paddingBottom: theme.space["3"],
    },
    head: {
        width: column,
        alignItems: "center",
        justifyContent: "center",
    },
    slot: {
        width: column,
        alignItems: "center",
        justifyContent: "center",
        variants: {
            noted: {
                true: { height: theme.control.lg.height + theme.space["2"] },
                false: { height: theme.control.md.height },
            },
        },
    },
    trail: {
        position: "absolute",
        top: 0,
        bottom: 0,
        insetInlineStart: -theme.stroke.thin,
        insetInlineEnd: -theme.stroke.thin,
        backgroundColor: theme.tone.neutral.soft,
    },
    trailHead: {
        insetInlineStart: "50%",
        borderStartStartRadius: theme.radius.control,
        borderEndStartRadius: theme.radius.control,
    },
    trailTail: {
        insetInlineEnd: "50%",
        borderStartEndRadius: theme.radius.control,
        borderEndEndRadius: theme.radius.control,
    },
    day: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.control,
    },
    endpoint: {
        backgroundColor: theme.tone.brand.base,
    },
    tag: {
        minHeight: theme.text.micro.latin.height,
    },
    unavailable: {
        textDecorationLine: "line-through",
    },

}));
