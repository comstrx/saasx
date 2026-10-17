import { defineSchema } from "../../../src/lib/spec/surface.ts";
import hello from "./hello.ts";

export default defineSchema({
    screens: [hello],
});
