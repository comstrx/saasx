import type { ResourceData } from "@/api/core/resource";
import { isValidPhoneNumber, parsePhoneNumberWithError } from "@/lib/providers/phone";

type Content = ResourceData<"content">;
type Labels = { call: string; email: string; whatsapp: string; follow: ( name: string ) => string };

const networks: Readonly<Record<string, { icon: string; name: string }>> = {
    instagram: { icon: "instagram", name: "Instagram" },
    facebook: { icon: "facebook", name: "Facebook" },
    x: { icon: "x-logo", name: "X" },
    twitter: { icon: "x-logo", name: "X" },
    tiktok: { icon: "tiktok", name: "TikTok" },
    snapchat: { icon: "snapchat", name: "Snapchat" },
    youtube: { icon: "youtube", name: "YouTube" },
    linkedin: { icon: "linkedin", name: "LinkedIn" },
    whatsapp: { icon: "whatsapp", name: "WhatsApp" },
};

function phone ( value: string | null | undefined ) {

    if ( !value || !isValidPhoneNumber(value) ) return undefined;

    const parsed = parsePhoneNumberWithError(value);

    return { display: parsed.formatInternational(), digits: parsed.number.replace("+", ""), uri: parsed.getURI() };

}
export function footerParts ( content: Content, labels: Labels ) {

    const call = phone(content.phone);
    const chat = phone(content.whatsapp ?? content.contacts.find(( entry ) => entry.key === "whatsapp")?.value);
    const contacts = [
        call ? { href: call.uri, label: labels.call, display: call.display, icon: "phone" } : undefined,
        content.email ? { href: `mailto:${content.email}`, label: labels.email, display: content.email, icon: "mail" } : undefined,
        chat ? { href: `https://wa.me/${chat.digits}`, label: labels.whatsapp, display: chat.display, icon: "whatsapp" } : undefined,
    ].filter(( entry ) => entry !== undefined);
    const socials = content.socials.flatMap(( entry ) => {

        const network = networks[entry.key.toLowerCase()];

        return network ? [{ href: entry.url, label: labels.follow(network.name), icon: network.icon }] : [];

    });
    const groups = content.link_groups.filter(( group ) => group.title && group.links.length).map(( group ) => ({
        title: group.title ?? "",
        links: group.links.map(( item ) => ({ href: item.href, label: item.label ?? item.href, external: item.external })),
    }));

    return { contacts, socials, groups };

}
