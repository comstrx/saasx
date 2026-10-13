import { createConnection, type LiveSource, liveSource, pusherRealtime, pusherUrl } from "@engine/socket";
import { config } from "@/lib/spec/runtime";

const realtime = config.realtime;

export const live: LiveSource | undefined = realtime
    ? liveSource(pusherRealtime(createConnection({ url: pusherUrl(realtime.url, realtime.key) })))
    : undefined;
