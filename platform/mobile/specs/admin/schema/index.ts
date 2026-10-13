import { defineSchema } from "../../../src/lib/spec/surface.ts";
import create from "./create.ts";
import dashboard from "./dashboard.ts";
import edit from "./edit.ts";
import login from "./login.ts";
import settings from "./settings.ts";

export default defineSchema({
    screens: [dashboard, create, edit, settings, login],
});
