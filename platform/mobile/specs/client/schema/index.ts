import { defineSchema } from "../../../src/lib/spec/surface.ts";
import account from "./account.ts";
import catalog from "./catalog.ts";
import emoji from "./emoji.ts";
import home from "./home.ts";
import login from "./login.ts";

export default defineSchema({
    screens: [home, emoji, account, catalog, login],
});
