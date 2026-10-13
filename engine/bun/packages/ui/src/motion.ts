export type Duration = keyof typeof durations;
export type Easing = keyof typeof easings;
export type Motion = { durations: Record<Duration, number>; easings: Record<Easing, string>; reduced: boolean };

export const durations = { instant: 0, fast: 120, base: 200, slow: 320, expressive: 600 } as const;
export const easings = {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    enter: "cubic-bezier(0, 0, 0, 1)",
    exit: "cubic-bezier(0.3, 0, 1, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

/**
 * The motion presets a surface animates with; under reduced motion every duration collapses to
 * zero so the same code renders states without movement.
 */
export function defineMotion(reduced: boolean): Motion {
    return {
        durations: reduced ? { instant: 0, fast: 0, base: 0, slow: 0, expressive: 0 } : { ...durations },
        easings: { ...easings },
        reduced,
    };
}
export function transition(
    motion: Motion,
    properties: readonly string[],
    duration: Duration = "base",
    easing: Easing = "standard",
): string {
    const ms = motion.durations[duration];

    return properties.map((property) => `${property} ${ms}ms ${motion.easings[easing]}`).join(", ");
}
