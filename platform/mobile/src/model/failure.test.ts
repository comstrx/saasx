import { ApiError } from "@/api/client";
import { reasonCopy } from "@/model/failure";

jest.mock("@/brand/i18n", () => {

    const words: Record<string, string> = {
        "error.gate.points.insufficient_balance": "points short",
        "error.reason.insufficient_balance": "balance short",
    };

    return { i18n: { t: ( key: string, options?: { defaultValue?: string } ) => words[key] ?? options?.defaultValue ?? key } };

});

describe("reasonCopy", () => {

    test("a refusal that names its gate speaks that gate's words, not the generic reason", () => {

        expect(reasonCopy(new ApiError(422, "validation", "", { points: [ "insufficient" ] }, null, "insufficient_balance"))).toBe("points short");

    });

    test("a gate the app has no words for falls back to the reason", () => {

        expect(reasonCopy(new ApiError(422, "validation", "", { amount: [ "short" ] }, null, "insufficient_balance"))).toBe("balance short");

    });

    test("an unnamed reason has no copy of its own", () => {

        expect(reasonCopy(new ApiError(500, "server", "", null))).toBeNull();

    });

});
