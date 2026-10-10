export type ContactField = "email" | "phone";
export type ContactChallenge = {
    channel: "email" | "sms" | "whatsapp"; length: number; retryAt: number; expiresAt: number | null;
};
type Reply = {
    channel?: string | null; length?: number | null; expires_in?: number | null; resend_after?: number | null;
};

export function contactChallenge ( reply: Reply, now = Date.now() ): ContactChallenge | null {

    if ( reply.channel !== "email" && reply.channel !== "sms" && reply.channel !== "whatsapp" ) return null;
    if ( !reply.length || !Number.isInteger(reply.length) || reply.length < 4 || reply.length > 12 ) return null;

    return {
        channel: reply.channel, length: reply.length,
        retryAt: now + Math.max(0, reply.resend_after ?? 0) * 1000,
        expiresAt: reply.expires_in == null ? null : now + Math.max(0, reply.expires_in) * 1000,
    };

}
