import type { Layer } from "engine/api";

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

export const reasons = [
    "done", "created", "updated", "deleted", "failed", "not_found", "forbidden", "unauthenticated",
    "verification_required", "invalid_input", "not_writable", "invalid_credentials", "invalid_code",
    "invalid_token", "invalid_state", "invalid_signature", "expired", "exists", "out_of_stock",
    "insufficient_balance", "not_allowed", "not_available", "not_started", "limit_exceeded", "below_minimum",
    "payment_failed", "price_changed", "requote_required", "currency_unavailable", "subscription_expired",
    "in_flight", "key_reused", "server_error",
] as const;
