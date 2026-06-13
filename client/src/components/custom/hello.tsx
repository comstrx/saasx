"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/custom/locale-switcher";
import { fadeRise, stagger, transition } from "@/lib/motion";

export function Hello () {

    const t = useTranslations("home");
    const reduce = useReducedMotion();

    return (

        <main className="relative flex flex-1 items-center justify-center overflow-hidden p-6">

            <div aria-hidden className="pointer-events-none absolute inset-0 bg-glow" />

            <motion.section
                variants={stagger}
                initial={reduce ? false : "hidden"}
                animate="visible"
                className="relative w-full max-w-xl"
            >

                <div className="flex flex-col items-center rounded-3xl border bg-card bg-surface px-8 py-14 text-center shadow-xl sm:px-14 sm:py-16">

                    <motion.span
                        variants={fadeRise}
                        transition={transition.base}
                        className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-3 py-1 text-xs font-medium uppercase tracking-widest text-gold-soft-foreground"
                    >

                        <span aria-hidden className="size-1.5 rotate-45 rounded-sm bg-gold" />
                        {t("eyebrow")}

                    </motion.span>

                    <motion.h1
                        variants={fadeRise}
                        transition={transition.base}
                        className="mt-6 text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-7xl"
                    >
                        {t("hello")}
                    </motion.h1>

                    <motion.p
                        variants={fadeRise}
                        transition={transition.base}
                        className="mt-4 max-w-md text-pretty text-base text-muted-foreground sm:text-lg"
                    >
                        {t("tagline")}
                    </motion.p>

                    <motion.div variants={fadeRise} transition={transition.base} className="mt-9">

                        <LocaleSwitcher />

                    </motion.div>

                </div>

            </motion.section>

        </main>

    );

}
