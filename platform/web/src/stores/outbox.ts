import { createOutbox, type Outbox } from "@engine/context";
import { persistent } from "@/lib/providers/storage";
import { identity } from "@/lib/spec/config";

export const outbox: Outbox = createOutbox({ store: persistent, key: `${identity}.outbox` });
