export type Presets = { durations: Record<string, number>; easings: Record<string, string> };
export type Motion = Presets & { reduced: boolean };

export function defineMotion(presets: Presets, reduced: boolean): Motion {
    return {
        durations: Object.fromEntries(Object.entries(presets.durations).map(([name, ms]) => [name, reduced ? 0 : ms])),
        easings: { ...presets.easings },
        reduced,
    };
}
export function transition(motion: Motion, properties: readonly string[], duration: string, easing: string): string {
    const ms = motion.durations[duration];
    const curve = motion.easings[easing];

    if (ms === undefined || curve === undefined) throw new Error(`Unknown motion ${duration}/${easing}`);

    return properties.map((property) => `${property} ${ms}ms ${curve}`).join(", ");
}
