import { defineSession } from "@engine/context";
import { secure } from "@/lib/providers/secure";
import { storage } from "@/lib/spec/config";

export const sessionStore = defineSession({ name: storage.session, store: secure });
