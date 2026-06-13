import type { Transition, Variants } from "motion/react";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const duration = {
    fast: 0.18,
    base: 0.34,
    slow: 0.5,
};

export const transition = {
    fast: { duration: duration.fast, ease },
    base: { duration: duration.base, ease },
    slow: { duration: duration.slow, ease },
} satisfies Record<string, Transition>;

export const fadeRise: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
};

export const stagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

export const lift = { y: -2 };
export const press = { scale: 0.95 };
