import { describe, expect, test } from "bun:test";
import { medianScores } from "../tools/lighthouse/index.ts";

describe("lighthouse floors", () => {

    test("each category is judged by the median of every run, so one noisy run neither fails nor passes the gate", () => {

        const run = ( performance: number, seo: number | null ) => ({ categories: { performance: { score: performance }, seo: { score: seo } } });

        expect(medianScores([run(0.87, 0.54), run(0.99, 0.54), run(0.95, null)])).toEqual({ performance: 95, seo: 54 });
        expect(medianScores([run(0.9, 0.5)])).toEqual({ performance: 90, seo: 50 });

    });

});
