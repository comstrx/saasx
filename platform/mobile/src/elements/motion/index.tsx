import { Children, createContext, isValidElement, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { I18nManager, LayoutAnimation, type LayoutChangeEvent, type StyleProp, View, type ViewStyle } from "react-native";
import Animated, { css, cubicBezier, FadeInDown, FadeOut, FadeOutUp, LinearTransition, linear, ReduceMotion, useReducedMotion } from "react-native-reanimated";
import { beats, curves, type SpringName, springPath, springs } from "@/theme/motion";
import { useTheme } from "@/theme/use-theme";

export type Glide = { duration: number; easing: ReturnType<typeof linear> };

export const glides = Object.fromEntries(Object.entries(springs).map(( [ name, spring ] ) => {

    const path = springPath(spring);

    return [ name, { duration: path.duration, easing: linear(...path.points) } ];

})) as Readonly<Record<SpringName, Glide>>;

export const eases = {
    standard: cubicBezier(...curves.standard),
    enter: cubicBezier(...curves.enter),
    exit: cubicBezier(...curves.exit),
} as const;

type Glided = keyof ViewStyle | ( keyof ViewStyle )[];

export function useGlide ( spring: SpringName, property: Glided ) {

    const still = useReducedMotion();

    return { transitionProperty: property, transitionDuration: still ? 0 : glides[spring].duration, transitionTimingFunction: glides[spring].easing };

}

export function useEase ( property: Glided, duration: number = beats.quick ) {

    const still = useReducedMotion();

    return { transitionProperty: property, transitionDuration: still ? 0 : duration, transitionTimingFunction: eases.standard };

}

export const useTint = () => useEase([ "backgroundColor", "borderColor" ]);

type AppearFrom = "below" | "above" | "start" | "end" | "still";

type AppearProps = {
    children: ReactNode;
    from?: AppearFrom | undefined;
    delay?: number | undefined;
    travel?: number | undefined;
    grow?: boolean | undefined;
    leave?: boolean | undefined;
    style?: StyleProp<ViewStyle> | undefined;
};

const reading = I18nManager.isRTL ? -1 : 1;

const Greeting = createContext(true);

const axes: Record<AppearFrom, { x: number; y: number }> = {
    below: { x: 0, y: 1 },
    above: { x: 0, y: -1 },
    start: { x: -reading, y: 0 },
    end: { x: reading, y: 0 },
    still: { x: 0, y: 0 },
};

export function Appear ({ children, from = "below", delay = 0, travel, grow = false, leave = false, style }: AppearProps) {

    const theme = useTheme();
    const still = useReducedMotion();
    const greeting = useContext(Greeting);
    const axis = axes[from];
    const reach = travel ?? theme.travel.far;
    const opening = grow ? 1 - theme.swell.pulse : axis.y === 0 ? 1 : 1 - theme.swell.rise;

    const rise = useMemo(() => css.keyframes({
        from: { opacity: 0, transform: [ { translateX: axis.x * reach }, { translateY: axis.y * reach }, { scale: opening } ] },
        to: { opacity: 1, transform: [ { translateX: 0 }, { translateY: 0 }, { scale: 1 } ] },
    }), [ axis.x, axis.y, reach, opening ]);

    const arrival = still || !greeting ? null : {
        animationName: rise,
        animationDuration: glides.enter.duration,
        animationTimingFunction: glides.enter.easing,
        animationDelay: delay,
        animationFillMode: "backwards",
    } as const;

    if ( !leave || still ) return <Animated.View style={[ style, arrival ]}>{children}</Animated.View>;

    return (
        <Animated.View exiting={FadeOut.duration(theme.beat.quick)} layout={LinearTransition.springify().damping(theme.spring.glide.damping).stiffness(theme.spring.glide.stiffness)} style={style}>
            <Animated.View style={arrival}>{children}</Animated.View>
        </Animated.View>
    );

}

type StaggerProps = {
    children: ReactNode;
    from?: AppearFrom | undefined;
    delay?: number | undefined;
    step?: number | undefined;
    leave?: boolean | undefined;
    style?: StyleProp<ViewStyle> | undefined;
};

export function Stagger ({ children, from = "below", delay = 0, step, leave = false, style }: StaggerProps) {

    const theme = useTheme();
    const beat = step ?? theme.beat.stagger;

    return (
        <>
            {Children.toArray(children).filter(isValidElement).map(( child, index ) => (
                <Appear key={child.key ?? index} from={from} delay={delay + Math.min(index, theme.beat.cap) * beat} leave={leave} style={style}>
                    {child}
                </Appear>
            ))}
        </>
    );

}

const welcome = beats.cap * beats.stagger + glides.enter.duration;

export function Greet ({ painted, children }: { painted: boolean; children: ReactNode }) {

    const [ open, setOpen ] = useState(true);

    useEffect(() => {

        if ( !painted ) return;

        const rest = setTimeout(() => setOpen(false), welcome);

        return () => clearTimeout(rest);

    }, [ painted ]);

    return <Greeting value={open}>{children}</Greeting>;

}

const reflowing = {
    duration: beats.calm,
    create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity, duration: beats.base },
    update: { type: LayoutAnimation.Types.easeInEaseOut },
    delete: { type: LayoutAnimation.Types.easeOut, property: LayoutAnimation.Properties.opacity, duration: beats.quick },
};

const same = ( one: readonly string[], two: readonly string[] ): boolean =>
    one.length === two.length && one.every(( key, at ) => two[at] === key );

const moved = ( before: readonly string[], after: readonly string[] ): number => {

    const kept = new Set(after);
    const had = new Set(before);

    return before.filter(( key ) => !kept.has(key) ).length + after.filter(( key ) => !had.has(key) ).length;

};

export function useReflow ( keys: readonly string[], prime?: () => void ) {

    const still = useReducedMotion();
    const [ seen, setSeen ] = useState(keys);

    if ( same(seen, keys) ) return;

    setSeen(keys);

    const shift = moved(seen, keys);
    const appended = keys.length > seen.length && same(seen, keys.slice(0, seen.length));

    if ( still || seen.length === 0 || appended || shift > beats.cap ) return;

    prime?.();
    LayoutAnimation.configureNext(reflowing);

}

type SwapProps = {
    children: ReactNode;
    watch: string;
    style?: StyleProp<ViewStyle> | undefined;
};

export function Swap ({ children, watch, style }: SwapProps) {

    const theme = useTheme();
    const still = useReducedMotion();
    const [ held, setHeld ] = useState({ key: watch, node: children });
    const [ shown, setShown ] = useState(true);
    const fade = useEase([ "opacity", "transform" ], theme.beat.instant);

    useEffect(() => {

        if ( watch === held.key ) {

            setHeld({ key: watch, node: children });

            return;

        }

        setShown(false);

        const swap = setTimeout(() => {

            setHeld({ key: watch, node: children });
            setShown(true);

        }, theme.beat.instant);

        return () => clearTimeout(swap);

    }, [ watch, children, held.key, theme.beat.instant ]);

    return (
        <Animated.View style={[ style, { opacity: shown ? 1 : 0, transform: [ { translateY: shown || still ? 0 : theme.travel.near } ] }, still ? null : fade ]}>
            {held.node}
        </Animated.View>
    );

}

type RevealProps = {
    children: ReactNode;
    open: boolean;
    style?: StyleProp<ViewStyle> | undefined;
};

export function Reveal ({ children, open, style }: RevealProps) {

    const [ span, setSpan ] = useState(0);
    const glide = useGlide("glide", [ "height", "opacity" ]);

    const measure = ( event: LayoutChangeEvent ) => {

        const next = Math.round(event.nativeEvent.layout.height);

        setSpan(( held ) => held === next ? held : next );

    };

    return (
        <Animated.View style={[ { overflow: "hidden", height: open ? span : 0, opacity: open ? 1 : 0, ...glide }, style ]}>
            <Animated.View onLayout={measure} style={{ position: span > 0 ? "absolute" : "relative", start: 0, end: 0, top: 0 }}>
                {children}
            </Animated.View>
        </Animated.View>
    );

}

type MorphProps = {
    watch: string;
    children: ReactNode;
    style?: StyleProp<ViewStyle> | undefined;
};

export function Morph ({ watch, children, style }: MorphProps) {

    const theme = useTheme();
    const settled = useRef(false);

    useEffect(() => {

        settled.current = true;

    }, []);

    const enter = FadeInDown.springify().damping(theme.spring.snap.damping).stiffness(theme.spring.snap.stiffness).reduceMotion(ReduceMotion.System);
    const leave = FadeOutUp.duration(theme.beat.quick).reduceMotion(ReduceMotion.System);

    return (
        <View style={[ { overflow: "hidden" }, style ]}>
            <Animated.View key={watch} {...( settled.current ? { entering: enter } : {} )} exiting={leave}>{children}</Animated.View>
        </View>
    );

}
