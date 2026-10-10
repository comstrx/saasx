import type { leadOf } from "@/elements/scroll/lead";

const travel = ( offset: number ) => ({ contentOffset: { x: offset }, contentSize: { width: 1000 }, layoutMeasurement: { width: 400 } });

const under = ( mirrored: boolean ): typeof leadOf => {

    let lead: typeof leadOf = () => Number.NaN;

    jest.isolateModules(() => {

        jest.replaceProperty(( require("react-native") as typeof import("react-native") ).I18nManager, "isRTL", mirrored);
        lead = ( require("@/elements/scroll/lead") as { leadOf: typeof leadOf } ).leadOf;

    });

    return lead;

};

describe("a horizontal scroll reads its travel from the start edge", () => {

    test("left to right, the travel is the offset itself", () => {

        const lead = under(false);

        expect(lead(travel(0))).toBe(0);
        expect(lead(travel(300))).toBe(300);

    });

    test("right to left, Android counts from the left edge, so the start sits at the far offset", () => {

        const lead = under(true);

        expect(lead(travel(600))).toBe(0);
        expect(lead(travel(250))).toBe(350);
        expect(lead(travel(0))).toBe(600);

    });

});
