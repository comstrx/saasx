import { z } from "zod";
import { call } from "@/api/client";

const link = z.object({
    key: z.string().nullable().optional(),
    value: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
});

const links = z.array(link).nullable().optional();

const site = z.object({
    name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    copyright: z.string().nullable().optional(),
    socials: links,
    contacts: links,
});

const block = z.object({
    id: z.number(),
    key: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    sort: z.number().nullable().optional(),
});

const blocks = z.array(block);

export type SiteRow = z.infer<typeof site>;

export type BlockRow = z.infer<typeof block>;

export const content = {

    site: (): Promise<SiteRow> => call({ path: "content/site-info", schema: site }),

    page: ( page: string ): Promise<readonly BlockRow[]> => call({ path: `content/${ encodeURIComponent(page) }`, schema: blocks }),

};
