import type { StandingRow } from "@/api/endpoints/account";
import { climbOf, levelOf } from "@/model/level";

const row = ( patch: Partial<StandingRow> ): StandingRow => ({ current: null, perks: [], progress: null, ...patch }) as StandingRow;

describe("a standing without a rank still carries the road to the first one", () => {

    test("no rank and a road answers rank 0 with the road", () => {

        const level = levelOf(row({ progress: { next_rank: 1, conditions: [ { key: "orders_count", window: 90, money: false, required: "1", reached: "1", remaining: "0", met: true } ] } }));

        expect(level?.rank).toBe(0);
        expect(level?.name).toBe("");
        expect(level?.progress?.rank).toBe(1);
        expect(climbOf(level?.progress ?? null)).toBe(1);

    });

    test("no rank and no road is nothing", () => {

        expect(levelOf(row({}))).toBeNull();

    });

});
