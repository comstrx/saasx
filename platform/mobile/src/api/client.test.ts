import { z } from "zod";
import { ApiError, failureOf } from "@/api/client";
import { envelope } from "@/api/contracts";

describe("failureOf", () => {

    it("passes an ApiError through untouched", () => {

        const original = new ApiError(422, "validation", "bad", { email: [ "taken" ] });

        expect(failureOf(original)).toBe(original);

    });
    it("turns anything else into an offline failure", () => {

        const wrapped = failureOf(new TypeError("Network request failed"));

        expect(wrapped.code).toBe("offline");
        expect(wrapped.offline).toBe(true);
        expect(wrapped.transient).toBe(true);

    });

});

describe("ApiError shape", () => {

    it("reads the confirmation gate off the validation payload", () => {

        const gated = new ApiError(422, "validation", "verification required", { confirm_code: [ "verification required" ] });

        expect(gated.confirmable).toBe(true);
        expect(new ApiError(422, "validation", "bad", { email: [ "taken" ] }).confirmable).toBe(false);

    });
    it("separates identity gates from plain forbidden", () => {

        expect(new ApiError(403, "forbidden", "", { identity: [ "required" ] }).identityRequired).toBe(true);
        expect(new ApiError(403, "forbidden", "", null).identityRequired).toBe(false);

    });
    it("marks only transport failures as retryable", () => {

        expect(new ApiError(500, "server", "", null).transient).toBe(true);
        expect(new ApiError(503, "unavailable", "", null).transient).toBe(true);
        expect(new ApiError(404, "not_found", "", null).transient).toBe(false);
        expect(new ApiError(429, "throttled", "", null).transient).toBe(false);

    });
    it("recognises the signed-out and missing cases", () => {

        expect(new ApiError(401, "unauthenticated", "", null).unauthenticated).toBe(true);
        expect(new ApiError(410, "gone", "", null).missing).toBe(true);
        expect(new ApiError(429, "throttled", "", null).throttled).toBe(true);

    });

});

describe("envelope without a schema", () => {

    it("accepts any payload instead of throwing", () => {

        const open = envelope(z.unknown());

        expect(open.safeParse({ status: true, code: "ok", message: "", data: { any: 1 }, errors: null }).success).toBe(true);
        expect(open.safeParse({ status: true, code: "ok", message: "", data: null }).success).toBe(true);

    });
    it("still surfaces a failing envelope", () => {

        const read = envelope(z.unknown()).safeParse({
            status: false,
            code: "validation",
            message: "bad",
            data: null,
            errors: { email: [ "taken" ] },
        });

        expect(read.success).toBe(true);
        expect(read.success && read.data.status).toBe(false);

    });

});
