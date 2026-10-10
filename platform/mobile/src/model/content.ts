import type { BlockRow, SiteRow } from "@/api/endpoints/content";

type ContentBlock = {
    id: number;
    key: string;
    title: string;
    body: string;
    note: string;
    url: string;
};

export type SiteLink = {
    key: string;
    value: string;
};

type SiteInfo = {
    name: string;
    email: string;
    phone: string;
    address: string;
    copyright: string;
    socials: readonly SiteLink[];
    contacts: readonly SiteLink[];
};

export const emptySiteInfo: SiteInfo = {
    name: "",
    email: "",
    phone: "",
    address: "",
    copyright: "",
    socials: [],
    contacts: [],
};

export const reachable = ( info: SiteInfo ): boolean =>
    Boolean(info.email || info.phone || info.contacts.length || info.socials.length);

const linked = ( rows: SiteRow["socials"] ): readonly SiteLink[] =>
    ( rows ?? [] ).flatMap(( row ): SiteLink[] => {

        const value = row.value ?? row.url ?? "";

        return row.key && value ? [ { key: row.key, value } ] : [];

    });

export const siteOf = ( data: SiteRow ): SiteInfo => ({
    name: data.name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    address: data.address ?? "",
    copyright: data.copyright ?? "",
    socials: linked(data.socials),
    contacts: linked(data.contacts),
});

export type Clause = {
    key: string;
    lead: string;
    text: string;
};

const numbering = /^[0-9\u0660-\u0669]+[.)]\s*/;

export const clausesOf = ( body: string ): readonly Clause[] =>
    body.split(/\n\s*\n/).map(( part ) => part.trim().replace(numbering, "") ).filter(Boolean).map(( part, index ) => {

        const [ , head = "", rest = "" ] = /^([^.?!؟\n]{2,40})[.?!؟]\s+([\s\S]+)$/.exec(part) ?? [];
        const lead = head.trim().split(/\s+/).length <= 5 ? head.trim() : "";

        return { key: `clause-${ index }`, lead, text: lead ? rest.trim() : part };

    });

export const blocksOf = ( rows: readonly BlockRow[] ): readonly ContentBlock[] =>
    [ ...rows ]
        .sort(( first, second ) => ( first.sort ?? 0 ) - ( second.sort ?? 0 ) )
        .map(( row ): ContentBlock => ({
            id: row.id,
            key: row.key ?? "",
            title: row.title ?? "",
            body: row.content ?? "",
            note: row.description ?? "",
            url: row.url ?? "",
        }));
