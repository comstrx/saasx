import { ApiError } from "@/api/client";
import { inlineFields } from "@/features/shell/hooks/use-submit";

describe("inlineFields", () => {

    test("a throttled refusal owns no field, so it can only toast", () => {

        expect(inlineFields(new ApiError(429, "throttled", "", null, null, "limit_exceeded"), [ "email", "password" ])).toEqual({});

    });

    test("a field the form owns lands inline, one it does not own stays out", () => {

        const refusal = new ApiError(422, "validation", "", { email: [ "taken" ], phone: [ "bad" ] });

        expect(inlineFields(refusal, [ "email" ])).toEqual({ email: "taken" });

    });

    test("an alias maps the server's field onto the form's own name", () => {

        const refusal = new ApiError(422, "validation", "", { recipient: [ "unknown" ] });

        expect(inlineFields(refusal, [ "to" ], { recipient: "to" })).toEqual({ to: "unknown" });

    });

});
