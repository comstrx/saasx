import { z } from "zod";
import { locales } from "@/lib/i18n/locales";

const envSchema = z.object({
    NEXT_PUBLIC_API_URL: z.url().default("http://localhost:8080"),
    DEFAULT_LOCALE: z.enum(locales).catch("en"),
});

export const env = envSchema.parse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    DEFAULT_LOCALE: process.env.DEFAULT_LOCALE,
});
