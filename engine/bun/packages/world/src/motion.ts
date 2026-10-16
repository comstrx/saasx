import { mapValues } from "engine/base";
import { cssBlock } from "./token.ts";

export type Presets = { durations: Record<string, number>; easings: Record<string, string> };
export type Motion = Presets & { reduced: boolean };

export function defineMotion ( presets: Presets, reduced: boolean ): Motion {

    return {
        durations: mapValues(presets.durations, ( ms ) => (reduced ? 0 : ms)),
        easings: { ...presets.easings },
        reduced,
    };

}
export function transition ( motion: Motion, properties: readonly string[], duration: string, easing: string ): string {

    const ms = motion.durations[duration];
    const curve = motion.easings[easing];

    if ( ms === undefined || curve === undefined ) throw new Error(`Unknown motion ${duration}/${easing}`);

    return properties.map(( property ) => `${property} ${ms}ms ${curve}`).join(", ");

}
export function motionVariables ( motion: Motion, selector: string ): string {

    return cssBlock(selector, [
        ...Object.entries(motion.durations).map(( [name, ms] ) => `--motion-${name}: ${ms}ms;`),
        ...Object.entries(motion.easings).map(( [name, curve] ) => `--ease-${name}: ${curve};`),
    ]);

}
