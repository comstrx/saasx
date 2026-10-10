import { document } from "../core/dsl.ts";

export default document("policy", "/contract", {
    cache: 300,
    response: {
        fields: {
            socket_scheme: "channels.realtime.scheme",
            socket_host: "channels.realtime.host",
            socket_port: "channels.realtime.port",
            socket_key: "channels.realtime.key",
            upload_max_bytes: "uploads.max_bytes",
            upload_max_count: "uploads.policies.default.max_count",
            request_max_bytes: "limits.request_max_bytes",
            upload_policies: "uploads.policies",
            blocked_extensions: "uploads.blocked_extensions",
            identity_mime_types: "uploads.identity.mime_types",
            bulk_max_ids: "limits.bulk_max_ids",
            availability_horizon_days: "limits.availability_horizon_days",
            availability_ahead_days: "limits.availability_ahead_days",
            password_min: "password.min",
            password_max: "password.max",
            password_lower: "password.lower",
            password_upper: "password.upper",
            password_digit: "password.digit",
            password_symbol: "password.symbol",
        },
    },
});
