import { defineSession } from "@engine/context";
import { store } from "@/lib/providers/storage";
import { storage } from "@/lib/spec/config";

export const sessionStore = defineSession({ name: storage.session, store });
