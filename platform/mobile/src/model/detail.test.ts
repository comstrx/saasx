import { spreadOf } from "@/model/detail";

describe("the rating spread folds the server's facet into five stars down to one", () => {

    test("each score lands on its own star, highest first", () => {

        expect(spreadOf({ "5": 2, "4": 2 })).toEqual([ 2, 2, 0, 0, 0 ]);

    });

    test("a decimal score rounds to its star and stray keys are ignored", () => {

        expect(spreadOf({ "4.6": 1, "5.0": 3, "1": 1, "0": 4, "nine": 2 })).toEqual([ 4, 0, 0, 0, 1 ]);

    });

    test("no facet is an empty spread", () => {

        expect(spreadOf({})).toEqual([ 0, 0, 0, 0, 0 ]);

    });

});
