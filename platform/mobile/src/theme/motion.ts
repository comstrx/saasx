import { I18nManager } from "react-native";

type Spring = {
    damping: number;
    stiffness: number;
    mass: number;
};

type Curve = readonly [ number, number, number, number ];

export const springs = {
    press: { damping: 153.5, stiffness: 5891, mass: 1 },
    enter: { damping: 34.5, stiffness: 298.2, mass: 1 },
    glide: { damping: 92.1, stiffness: 2121, mass: 1 },
    settle: { damping: 34.5, stiffness: 298.2, mass: 1 },
    sheet: { damping: 53.1, stiffness: 706, mass: 1 },
    snap: { damping: 69, stiffness: 1192.9, mass: 1 },
    bounce: { damping: 32.9, stiffness: 751, mass: 1 },
    release: { damping: 53.1, stiffness: 2333, mass: 1 },
    trail: { damping: 46.1, stiffness: 734, mass: 1 },
} as const satisfies Record<string, Spring>;

export type SpringName = keyof typeof springs;

export const springPath = ({ damping, stiffness, mass }: Spring, samples = 32 ): { duration: number; points: readonly number[] } => {

    const omega = Math.sqrt(stiffness / mass);
    const zeta = damping / ( 2 * Math.sqrt(stiffness * mass) );
    const spread = omega * Math.sqrt(Math.abs(zeta * zeta - 1));
    const decay = zeta < 1 ? zeta * omega : zeta * omega - spread;

    const at = ( t: number ): number => {

        if ( zeta < 1 ) return 1 - Math.exp(-zeta * omega * t) * ( Math.cos(spread * t) + ( zeta * omega / spread ) * Math.sin(spread * t) );
        if ( spread === 0 ) return 1 - Math.exp(-omega * t) * ( 1 + omega * t );

        const fast = -zeta * omega - spread;
        const slow = -zeta * omega + spread;

        return 1 + ( fast * Math.exp(slow * t) - slow * Math.exp(fast * t) ) / ( slow - fast );

    };

    const seconds = Math.log(1000) / decay;
    const points = Array.from({ length: samples + 1 }, ( _, step ) => step === samples ? 1 : Math.round(at(seconds * step / samples) * 1000) / 1000 );

    return { duration: Math.round(seconds * 1000), points };

};

export const curves = {
    enter: [ 0.05, 0.7, 0.1, 1 ],
    exit: [ 0.3, 0, 0.8, 0.15 ],
    standard: [ 0.2, 0, 0, 1 ],
} as const satisfies Record<string, Curve>;

export const beats = {
    instant: 90,
    quick: 150,
    base: 200,
    calm: 260,
    slow: 400,
    rest: 1200,
    stagger: 40,
    cap: 6,
    rise: 14,
    pulse: 1200,
    sweep: 900,
    spin: 800,
} as const;

export const travel = {
    near: 6,
    mid: 12,
    far: 20,
} as const;

export const swell = {
    rise: 0.02,
    pulse: 0.04,
    pop: 0.06,
    hero: 0.08,
} as const;

export const fade = {
    dip: 0.12,
    hush: 0.35,
    half: 0.6,
    mute: 0.7,
    band: 0.5,
} as const;

export const sink = {
    tile: 0.985,
    card: 0.975,
    control: 0.96,
    disc: 0.92,
} as const;

export type SinkName = keyof typeof sink;

export const ambient = {
    cycle: 5200,
    echo: 6800,
    breathe: 4200,
    drift: 2,
    depth: 1.015,
    dim: 0.76,
    scale: 1.06,
} as const;

export const firefly = {
    x: 8, y: 12, dim: 0.45, scale: 0.72, cycle: 4800, stagger: 600,
} as const;

export const launchMotion = {
    duration: 5000, exit: 360,
    arrive: 1400, turns: 2, depth: 900,
} as const;

export const push = I18nManager.isRTL ? "ios_from_left" as const : "ios_from_right" as const;
