import { read } from "@/api/workflow/server";
import { entityHref } from "@/hooks/use-catalog";
import { productCard, productFields, productLabels } from "@/hooks/use-product-card";
import { getTranslations } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import type { Route } from "@/lib/spec/feature";
import { screens } from "@/lib/spec/server";
import { day, instant, money, percent } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { entityId, fillPattern } from "@/lib/std/route";

type Offer = Awaited<ReturnType<typeof read<"offers", "list">>>["resource"][number];

const week = 7 * 86400000;

export async function deals ( match: ( offer: number | null | undefined ) => boolean, limit: number ) {

    const labels = await productLabels();

    try {

        const result = await read("products", "list", { limit: 60, fields: productFields });

        return result.resource.filter(( row ) => row.offer && match(row.offer.id)).slice(0, limit).map(( row ) => ({
            card: productCard(row, {
                locale: labels.locale, href: entityHref("product", row, labels.locale), badges: true, labels: labels.card,
            }),
            currencyLabel: labels.view.currency(row.currency ?? "USD"),
        }));

    }
    catch {

        return [];

    }

}
async function voucher ( offer: Offer, locale: string ) {

    const t = await getTranslations("offers");
    const page = screens.find(( screen ) => screen.name === "offer");
    const rate = percent(offer.rate, locale);
    const found = money(offer.value, locale, "USD", true);
    const amount = found ? found.before ? `${found.currency} ${found.number}` : `${found.number} ${found.currency}` : null;
    const cap = money(offer.cap, locale, "USD", true);
    const left = offer.expires_at ? instant(offer.expires_at) - Date.now() : null;

    return {
        key: String(offer.id),
        value: rate ?? amount ?? "%",
        caption: t("stub"),
        name: offer.name ?? "",
        description: offer.description ?? null,
        terms: [
            offer.type ? t(`kinds.${offer.type === "flash" ? "flash" : offer.type === "seasonal" ? "seasonal" : "standard"}`) : null,
            cap && rate ? t("cap", { amount: cap.before ? `${cap.currency} ${cap.number}` : `${cap.number} ${cap.currency}` }) : null,
            offer.targets?.length ? null : t("everything"),
        ].filter(( value ): value is string => Boolean(value)),
        expires: offer.expires_at ? t("endsOn", { date: day(offer.expires_at, locale, { day: "numeric", month: "short" }) }) : null,
        status: left != null && left > 0 && left < week
            ? { label: t("endsIn", { count: Math.floor(left / 86400000) }), tone: "ember" as const } : null,
        href: page ? localePath(locale, fillPattern(page.path, { offerId: String(offer.id) }), routing) : null,
        until: offer.expires_at ?? null,
    };

}
export async function board () {

    const [t, labels] = await Promise.all([getTranslations("offers"), productLabels()]);
    const { locale } = labels;
    const campaignPage = screens.find(( screen ) => screen.name === "campaign");

    try {

        const [offers, campaigns, picked] = await Promise.all([
            read("offers", "list", { limit: 20 }).then(( reply ) => reply.resource),
            read("campaigns", "list", { limit: 6 }).then(( reply ) => reply.resource).catch(() => []),
            deals(() => true, 8),
        ]);
        const live = offers.filter(( offer ) => !offer.expires_at || instant(offer.expires_at) > Date.now())
            .sort(( a, b ) => (b.priority ?? 0) - (a.priority ?? 0));

        return {
            offers: await Promise.all(live.map(( offer ) => voucher(offer, locale))),
            campaigns: campaigns.filter(( campaign ) => campaign.state !== "ended").map(( campaign ) => ({
                key: String(campaign.id),
                href: campaignPage
                    ? localePath(locale, fillPattern(campaignPage.path, { campaignId: String(campaign.id) }), routing) : null,
                title: campaign.title ?? "",
                body: campaign.content ?? "",
                offers: (campaign.offers ?? []).map(( offer ) => offer.name ?? "").filter(Boolean),
            })),
            deals: picked,
            labels: {
                live: t("live"), liveBody: t("liveBody"), campaigns: t("campaigns"), deals: t("dealsNow"), dealsBody: t("dealsBody"),
                view: t("view"), empty: { title: t("emptyTitle"), body: t("emptyBody") },
            },
        };

    }
    catch {

        return null;

    }

}
export async function detail ( route: Route ) {

    const [t, labels] = await Promise.all([getTranslations("offers"), productLabels()]);
    const { locale } = labels;
    const offerId = entityId(route.parameters.offerId);
    const index = screens.find(( screen ) => screen.name === "offers");

    if ( !offerId ) return null;

    try {

        const offer = (await read("offers", "view", { offerId })).resource;
        const [card, matched] = await Promise.all([voucher(offer, locale), deals(( id ) => id === offerId, 24)]);

        return {
            card,
            back: index ? { href: localePath(locale, index.path, routing), label: t("browse") } : null,
            deals: matched,
            more: matched.length ? [] : await deals(() => true, 8),
            labels: {
                deals: t("deals"), dealsBody: t("dealsHint"), countdown: t("endsSoon"), more: t("moreDeals"), moreBody: t("moreDealsBody"),
                noneBody: t("noDealsBody"),
            },
        };

    }
    catch {

        return null;

    }

}
export async function campaign ( route: Route ) {

    const [t, labels] = await Promise.all([getTranslations("offers"), productLabels()]);
    const { locale } = labels;
    const campaignId = entityId(route.parameters.campaignId);
    const index = screens.find(( screen ) => screen.name === "offers");

    if ( !campaignId ) return null;

    try {

        const row = (await read("campaigns", "view", { campaignId })).resource;
        const ids = (row.offers ?? []).map(( offer ) => offer.id);
        const matched = await deals(( id ) => id != null && ids.includes(id), 12);

        return {
            title: row.title ?? "",
            body: row.content ?? null,
            back: index ? { href: localePath(locale, index.path, routing), label: t("browse") } : null,
            offers: await Promise.all((row.offers ?? []).map(( offer ) => voucher(offer, locale))),
            faqs: (row.faqs ?? []).flatMap(( faq, position ) => {

                const question = String(faq.question ?? faq.title ?? "");
                const answer = String(faq.answer ?? faq.content ?? "");

                return question && answer ? [{ key: `faq-${position}`, title: question, body: answer }] : [];

            }),
            deals: matched,
            more: matched.length ? [] : await deals(() => true, 8),
            labels: {
                offers: t("included"), faqs: t("faqs"), deals: t("deals"), dealsBody: t("dealsHint"), none: t("noDeals"),
                noneBody: t("noDealsBody"), more: t("moreDeals"), moreBody: t("moreDealsBody"),
            },
        };

    }
    catch {

        return null;

    }

}
