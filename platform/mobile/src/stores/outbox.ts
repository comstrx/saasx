import { createOutbox, type Outbox } from "@engine/context";
import { store } from "@/lib/providers/storage";
import { identity } from "@/lib/spec/config";

export const outbox: Outbox = createOutbox({ store, key: `${identity}.outbox` });
