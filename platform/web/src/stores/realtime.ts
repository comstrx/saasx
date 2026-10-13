import { createConnection, type LiveSource, liveSource, pusherRealtime, pusherUrl } from "@engine/socket";
import { browser } from "@/lib/spec/browser";

const realtime = browser?.realtime ?? null;

export const live: LiveSource | undefined = realtime && typeof WebSocket !== "undefined"
    ? liveSource(pusherRealtime(createConnection({ url: pusherUrl(realtime.url, realtime.key) })))
    : undefined;
