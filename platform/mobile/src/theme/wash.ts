import type { BoxShadowValue } from "react-native";
import { alpha } from "@/std/color";
import type { Ceramic, Tone } from "@/theme/roles";

type Stop = readonly [ string, number ];

export const linear = ( angle: number, stops: readonly Stop[] ): string =>
    `linear-gradient(${ angle }deg, ${ stops.map(([ color, at ]) => `${ color } ${ Math.round(at * 100) }%` ).join(", ") })`;

export const ramp = ( from: string, to: string, angle = 160 ): string => linear(angle, [ [ from, 0 ], [ to, 1 ] ]);

export const veil = ( color: string, from: number, to: number, angle = 180 ): string =>
    linear(angle, [ [ alpha(color, from), 0 ], [ alpha(color, to), 1 ] ]);

export const halo = ( color: string, weight: number, core = 0 ): string =>
    `radial-gradient(circle closest-side, ${ alpha(color, weight) } ${ Math.round(core * 100) }%, ${ alpha(color, weight * 0.35) } ${ Math.round((0.55 + core * 0.45) * 100) }%, ${ alpha(color, 0) } 100%)`;

export const shade = ( color: string, ramp: readonly ( readonly [ number, number ] )[], angle = 180 ): string =>
    linear(angle, ramp.map(([ at, weight ]) => [ alpha(color, weight), at ] as const));

export const glaze = ( ceramic: Ceramic ): { backgroundColor: string; boxShadow: BoxShadowValue[] } => ({
    backgroundColor: ceramic.fill,
    boxShadow: [],
});

export const glazeTone = ( tone: Tone ): ReturnType<typeof glaze> =>
    glaze({ fill: tone.base, light: tone.bright, shade: tone.deep, glow: tone.glow, rim: "rgba(255, 255, 255, 0.22)", ink: tone.on });
