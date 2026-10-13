import type { Layer } from "@engine/api";

export const core: Layer = {
    request: {
        headers: {
            tenant: "X-Tenant-Domain",
            language: "Accept-Language",
            currency: "X-Currency",
            requestId: "X-Request-Id",
            idempotency: "Idempotency-Key",
            auth: { name: "Authorization", prefix: "Bearer " },
        },
    },
    response: {
        success: { path: "status", equals: true },
        data: "data",
        message: "message",
        errors: "errors",
        code: "code",
        reason: "reason",
        requestId: "meta.request_id",
        pagination: { page: "meta.page", limit: "meta.limit", total: "meta.total", pages: "meta.pages" },
    },
};
