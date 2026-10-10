import { settledShift, shiftOf } from "@/elements/empty/centre";

describe("an empty block sits at the centre of what the eye can see", () => {

    test("a seat that runs under the bottom chrome lifts the block by the overshoot", () => {

        expect(shiftOf({ top: 100, tall: 700 }, 300, 740, settledShift)).toEqual({ top: 0, bottom: 60 });

    });

    test("a seat that ends above the visible bottom lowers the block into the band", () => {

        expect(shiftOf({ top: 100, tall: 600 }, 300, 740, settledShift)).toEqual({ top: 40, bottom: 0 });

    });

    test("the offset never spends the seat's last slack, so the next measure keeps it", () => {

        const first = shiftOf({ top: 100, tall: 400 }, 300, 200, settledShift);

        expect(first).toEqual({ top: 0, bottom: 98 });
        expect(shiftOf({ top: 100, tall: 400 }, 300, 200, first)).toEqual(first);

    });

    test("a seat sized by its content is never padded", () => {

        expect(shiftOf({ top: 900, tall: 300 }, 300, 740, settledShift)).toBe(settledShift);
        expect(shiftOf({ top: 900, tall: 360 }, 300, 740, { top: 0, bottom: 60 })).toBe(settledShift);

    });

});
