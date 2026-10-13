import { defineSession } from "@engine/context";
import { session } from "@/lib/providers/storage";
import { identity } from "@/lib/spec/config";

export const sessionStore = defineSession({ name: `${identity}.session`, store: session });
