import { z } from "zod";

if ( typeof window !== "undefined" ) z.config({ jitless: true });

export { z };
