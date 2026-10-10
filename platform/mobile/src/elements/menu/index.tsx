import { type ReactNode, type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { I18nManager, Modal, Pressable, useWindowDimensions, View } from "react-native";
import Animated, { css, useReducedMotion } from "react-native-reanimated";
import { Icon, type IconName } from "@/elements/icon";
import { useLabels } from "@/elements/labels";
import { eases, useEase } from "@/elements/motion";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

export type MenuItem = {
    key: string;
    label: string;
    icon?: IconName | undefined;
    danger?: boolean | undefined;
    band?: boolean | undefined;
    onPress: () => void;
};

type MenuProps = {
    open: boolean;
    anchor: RefObject<View | null>;
    items: readonly MenuItem[];
    onClose: () => void;
    crown?: ReactNode | undefined;
    beside?: boolean | undefined;
};

type Spot = { top: number; side: "left" | "right"; edge: number; below: boolean };

export function Menu ({ open, anchor, items, onClose, crown, beside = false }: MenuProps) {

    const theme = useTheme();
    const labels = useLabels();
    const still = useReducedMotion();
    const screen = useWindowDimensions();
    const [ mounted, setMounted ] = useState(open);
    const [ shown, setShown ] = useState(false);
    const [ spot, setSpot ] = useState<Spot | null>(null);
    const showing = useRef(false);
    const menu = theme.composition.menu;
    const tall = items.length * menu.row + items.filter(( item ) => item.band ).length * menu.band + menu.pad * 2;
    const lid = crown ? menu.crown + menu.margin : 0;

    useEffect(() => {

        if ( open ) {

            setMounted(true);
            anchor.current?.measureInWindow(( x, y, width, height ) => {

                const right = x + width / 2 > screen.width / 2;
                const below = beside
                    ? y + height + menu.margin + lid + tall <= screen.height - menu.margin
                    : y + tall <= screen.height - menu.margin;
                const top = beside
                    ? below ? y + height + menu.margin : Math.max(menu.margin, y - menu.margin - lid - tall)
                    : below ? y : Math.max(menu.margin, y + height - tall);

                setSpot({
                    top,
                    side: right ? "right" : "left",
                    edge: right ? Math.max(menu.margin, screen.width - x - width) : Math.max(menu.margin, x),
                    below,
                });

            });

            if ( showing.current ) setShown(true);

            return;

        }

        setShown(false);

        const linger = setTimeout(() => {

            showing.current = false;
            setMounted(false);

        }, theme.beat.quick + 40);

        return () => clearTimeout(linger);

    }, [ open, anchor, beside, screen.width, screen.height, tall, lid, menu.margin, theme.beat.quick ]);

    const grow = useEase([ "opacity", "transform" ], theme.beat.base);
    const fold = useEase([ "opacity", "transform" ], theme.beat.quick);

    const arriving = useMemo(() => css.keyframes({
        from: { opacity: 0, transform: [ { translateY: -theme.travel.near } ] },
        to: { opacity: 1, transform: [ { translateY: 0 } ] },
    }), [ theme.travel.near ]);

    if ( !mounted || !spot ) return null;

    const leading = ( spot.side === "left" ) !== I18nManager.isRTL;
    const origin = `${ spot.below ? "top" : "bottom" } ${ spot.side }`;

    return (
        <Modal
            visible
            transparent
            animationType="none"
            statusBarTranslucent
            navigationBarTranslucent
            onShow={() => { showing.current = true; if ( open ) setShown(true); }}
            onRequestClose={onClose}
        >
            <Pressable accessibilityRole="button" accessibilityLabel={labels.close} style={{ flex: 1 }} onPress={onClose}>
                <Animated.View
                    accessibilityViewIsModal
                    style={[ {
                        position: "absolute",
                        top: spot.top,
                        ...( leading ? { insetInlineStart: spot.edge } : { insetInlineEnd: spot.edge } ),
                        alignItems: leading ? "flex-start" : "flex-end",
                        gap: menu.margin,
                        maxWidth: screen.width - menu.margin * 2,
                        transformOrigin: origin,
                        opacity: shown ? 1 : 0,
                        transform: [ { scale: shown || still ? 1 : menu.from } ],
                    }, shown ? { ...grow, transitionTimingFunction: eases.enter } : { ...fold, transitionTimingFunction: eases.exit } ]}
                >
                    {crown}

                    <View
                        style={{
                            minWidth: menu.width,
                            paddingVertical: menu.pad,
                            borderRadius: theme.radius.card,
                            backgroundColor: theme.plane.raised,
                            boxShadow: theme.cast.raise,
                            overflow: "hidden",
                        }}
                    >
                        {items.map(( item, index ) => {

                            const paint = item.danger ? theme.tone.danger.onSoft : theme.ink.strong;

                            return (
                                <View key={item.key}>
                                    {item.band ? <View style={{ height: menu.band, backgroundColor: theme.plane.sunken }} /> : null}

                                    <Animated.View
                                        style={still ? null : {
                                            animationName: arriving,
                                            animationDuration: theme.beat.base,
                                            animationTimingFunction: eases.enter,
                                            animationDelay: Math.min(index, theme.beat.cap) * menu.step,
                                            animationFillMode: "backwards",
                                        }}
                                    >
                                        <Press
                                            feel="ripple"
                                            accessibilityRole="menuitem"
                                            accessibilityLabel={item.label}
                                            onPress={() => { onClose(); item.onPress(); }}
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: menu.gap,
                                                height: menu.row,
                                                paddingHorizontal: menu.inset,
                                            }}
                                        >
                                            {item.icon ? <Icon name={item.icon} size={theme.icon.lg} color={paint} /> : null}
                                            <Text rank="body" color={paint} numberOfLines={1} style={{ flexShrink: 1 }}>{item.label}</Text>
                                        </Press>
                                    </Animated.View>
                                </View>
                            );

                        })}
                    </View>
                </Animated.View>
            </Pressable>
        </Modal>
    );

}
