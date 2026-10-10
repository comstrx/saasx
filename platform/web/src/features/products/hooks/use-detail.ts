import { read, siteSettings } from "@/api/workflow/server";
import { catalogScreen, entityHref, screenHref } from "@/hooks/use-catalog";
import { productCard, productLabels } from "@/hooks/use-product-card";
import { getTranslations } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import type { Route, Screen } from "@/lib/spec/feature";
import { placements, screens, text } from "@/lib/spec/server";
import { bookingPerks } from "@/lib/std/availability";
import { amountOf, count, day, decimal, distance, money } from "@/lib/std/format";
import { metersBetween, placePoint } from "@/lib/std/geo";
import { queryHref, queryNumber } from "@/lib/std/listing";
import { localePath } from "@/lib/std/locale";
import { entityId, fillPattern } from "@/lib/std/route";
import { calendarToday, searchState } from "@/lib/std/search";
import {
    detailGroups, familyOf, localClock, mapLink, productAmenities, productFacts, productPictures, validDay,
} from "./use-detail-shape";

type Props = { screen: Screen; route: Route; atlas: { tiles: string; credit: string } };

const words = [[4.7, "exceptional"], [4.4, "excellent"], [4, "veryGood"], [3.5, "good"], [0, "pleasant"]] as const;
const sections = ["stay", "included", "before", "transport", "booking", "entry", "documents", "processing", "shipping", "access"] as const;
const deliveries = ["shipping", "pickup", "digital", "delivery"] as const;
const modes = ["train", "bus", "flight", "ferry", "car"] as const;
const measures = ["beds", "bedrooms", "bathrooms", "area"];
const layouts = {
    lodge: "booking",
    room: "booking",
    goods: "showcase",
    stay: "mosaic",
    experience: "mosaic",
    event: "mosaic",
    ticket: "mosaic",
    transport: "mosaic",
    service: "mosaic",
    document: "mosaic",
    insurance: "mosaic",
} as const;

type Group = (typeof sections)[number];
type Delivery = (typeof deliveries)[number];
type Mode = (typeof modes)[number];

function wordOf ( rating: number ): (typeof words)[number][1] {

    return words.find(( [floor] ) => rating >= floor)?.[1] ?? "pleasant";

}
function known<T extends string> ( list: readonly T[], value: string | null | undefined ): value is T {

    return Boolean(value) && (list as readonly string[]).includes(value as string);

}
export async function detail ( { route, atlas }: Props ) {

    const [t, common, booking, labels, nav, settings, deals] = await Promise.all([
        getTranslations("detail"), getTranslations("common"), getTranslations("booking"), productLabels(), getTranslations("nav"),
        siteSettings(), getTranslations("offers"),
    ]);
    const { locale } = labels;
    const productId = entityId(route.parameters.productId);
    const failure = {
        art: "/assets/images/brand/error.webp",
        title: common("failedTitle"), description: common("failedBody"), retry: common("retry"),
    };

    if ( !productId ) return { failed: true as const, failure };

    try {

        const [{ resource: product }, effective] = await Promise.all([
            read("products", "view", {
                productId,
                adults: queryNumber(route.query, "adults", 1, 30),
                children: queryNumber(route.query, "children", 0, 30),
            }),
            read("offers", "effective", { productId }).then(( reply ) => reply.resource.offer ?? null).catch(() => null),
        ]);
        const running = effective?.offer_id
            ? await read("offers", "view", { offerId: effective.offer_id }).then(( reply ) => reply.resource).catch(() => null)
            : null;
        const offerScreen = screens.find(( screen ) => screen.name === "offer");
        const amountText = ( value: string | number | null | undefined, currency: string ) => {

            const found = money(value, locale, currency, true);

            return found ? found.before ? `${found.currency} ${found.number}` : `${found.number} ${found.currency}` : "";

        };
        const kind = effective?.type === "flash" || effective?.type === "seasonal" ? effective.type : "standard";
        const abilities = new Set(product.capabilities ?? []);
        const family = familyOf(abilities, product.type);
        const stay = abilities.has("lodging");
        const path = entityHref("product", product, locale) ?? "";
        const parent = family === "room" && product.parent ? product.parent : null;
        const listing = catalogScreen(parent?.type ?? product.type);
        const back = screenHref(listing, locale);
        const card = productCard(product, { locale, href: path, badges: true, labels: labels.card });
        const arrive = stay ? localClock(product.checkin_time, locale) : null;
        const leave = stay ? localClock(product.checkout_time, locale) : null;
        const groups = detailGroups(product.details);
        const facts = [
            ...(arrive ? [{ key: "arrive", term: t("checkin"), detail: arrive, icon: "door" }] : []),
            ...(leave ? [{ key: "leave", term: t("checkout"), detail: leave, icon: "luggage" }] : []),
            ...card.facts.map(( fact, index ) => ({ key: `context-${index}`, term: fact.text, icon: fact.icon })),
        ];
        const selected = queryNumber(route.query, "room", 1, Number.MAX_SAFE_INTEGER);
        const policies = (product.policies ?? []).flatMap(( policy ) => {

            const lines = [
                policy.description,
                policy.refundable === false ? t("nonRefundable") : null,
                policy.free_before_hours ? t("freeCancel", { hours: policy.free_before_hours }) : null,
                policy.refund_dest === "wallet" ? t("refundWallet") : null,
                policy.refund_dest === "source" ? t("refundSource") : null,
            ].filter(Boolean);

            return lines.length ? [{ key: String(policy.id), title: policy.title || t("policy"), body: lines.join("\n\n") }] : [];

        });
        const flexible = (product.policies ?? []).some(( policy ) => policy.refundable !== false && Boolean(policy.free_before_hours));
        const freeHours = (product.policies ?? []).filter(( policy ) => policy.type === "cancellation" && policy.refundable !== false)
            .map(( policy ) => policy.free_before_hours ?? 0).filter(( hours ) => hours > 0).sort(( a, b ) => b - a)[0];
        const perks = [
            ...(flexible ? [t("freeCancellation")] : []),
            ...(product.allow_pay_later ? [t("payLater")] : []),
        ];
        const rooms = (product.sellables ?? []).map(( room ) => {

            const price = money(room.min_price, locale, product.currency ?? undefined) ?? null;
            const measure = ( key: string ) => {

                const value = room.features && !Array.isArray(room.features) ? Number(room.features[key]) : 0;

                return Number.isFinite(value) && value > 0 ? value : 0;

            };
            const beds = measure("beds");
            const baths = measure("bathrooms");
            const area = measure("area");

            return {
                id: room.id,
                name: room.name ?? "",
                href: entityHref("product", { id: room.id, slug: null, type: "room" }, locale),
                price,
                amount: amountOf(room.min_price, product.currency ?? undefined)?.amount ?? null,
                brief: [area ? t("area", { area: String(area) }) : null, room.adults ? t("adultCapacity", { count: room.adults }) : null]
                    .filter(Boolean).join(" · "),
                currencyLabel: labels.view.currency(price?.currency ?? product.currency ?? "USD"),
                facts: [
                    ...(room.adults ? [t("adultCapacity", { count: room.adults })] : []),
                    ...(room.children ? [t("childCapacity", { count: room.children })] : []),
                    ...(beds ? [t("beds", { count: beds })] : []),
                    ...(baths ? [t("baths", { count: baths })] : []),
                    ...(area ? [t("area", { area: String(area) })] : []),
                ],
                features: [
                    ...(area ? [{ key: "area", icon: "area", text: t("area", { area: String(area) }) }] : []),
                    ...(beds ? [{ key: "beds", icon: "bed", text: t("beds", { count: beds }) }] : []),
                    ...(baths ? [{ key: "baths", icon: "bath", text: t("baths", { count: baths }) }] : []),
                ],
                sleeps: {
                    adults: room.adults ?? 0,
                    children: room.children ?? 0,
                    label: [
                        room.adults ? t("adultCapacity", { count: room.adults }) : null,
                        room.children ? t("childCapacity", { count: room.children }) : null,
                    ].filter(Boolean).join(" · "),
                },
                status: room.sold_out ? t("soldOut") : room.fits === false ? t("partyMismatch") : null,
                select: room.sold_out ? null : `${queryHref(path, route.query, { room: String(room.id) })}#booking`,
                current: selected === room.id,
            };

        });
        const lead = rooms.find(( room ) => room.current) ?? rooms.filter(( room ) => room.price && !room.status)
            .sort(( a, b ) => (a.amount ?? Number.MAX_VALUE) - (b.amount ?? Number.MAX_VALUE))[0];
        const initial = queryHref("", route.query, {}).slice(1);
        const asked = searchState(new URLSearchParams(initial));
        const host = product.host ?? product.vendor;
        const since = validDay(host?.member_since, locale);
        const rating = Number(product.rating ?? 0);
        const reviews = product.reviews ?? 0;
        const geo = product.geo;
        const address = [geo?.address, geo?.city?.name, geo?.country?.name].filter(Boolean).join(locale === "ar" ? "، " : ", ") || null;
        const point = placePoint(geo);
        const pin = point ? { ...point, key: "place", kind: "home" as const, title: product.name, href: null } : null;
        const map = mapLink(point);
        const home = localePath(locale, "/", routing);
        const trail = [
            { label: nav("home"), href: home },
            ...(back && listing ? [{ label: text(listing.title, locale), href: back }] : []),
            ...(parent ? [{ label: parent.name ?? "", href: entityHref("product", parent, locale) ?? undefined }] : []),
            ...(geo?.city?.name && !parent ? [{ label: geo.city.name }] : []),
            { label: product.name },
        ];
        const begins = product.starts_at && Number.isFinite(Date.parse(product.starts_at)) ? new Date(product.starts_at) : null;
        const length = Number(product.duration ?? 0);
        const span = length > 0 && product.duration_unit === "day" ? t("days", { count: length })
            : length > 0 && product.duration_unit === "hour" ? t("hours", { count: length }) : null;
        const names = new Intl.DisplayNames([locale], { type: "language" });
        const languages = (product.locales ?? []).map(( code ) => names.of(code) ?? code);
        const comma = locale === "ar" ? "، " : ", ";
        const highlights = [
            ...(flexible ? [{
                key: "cancel", icon: "calendar-check", title: t("freeCancellation"), detail: t("freeCancellationBody"),
            }] : []),
            ...(product.allow_pay_later ? [{ key: "later", icon: "wallet", title: t("payLater"), detail: t("payLaterBody") }] : []),
            ...(arrive ? [{ key: "arrive", icon: "door", title: t("checkin"), detail: t("after", { time: arrive }) }] : []),
            ...(leave ? [{ key: "leave", icon: "luggage", title: t("checkout"), detail: t("until", { time: leave }) }] : []),
            ...(span ? [{ key: "span", icon: "clock", title: t("duration"), detail: span }] : []),
            ...(product.capacity ? [{
                key: "capacity", icon: "users", title: t("groupSize"), detail: t("upTo", { count: product.capacity }),
            }] : []),
            ...(languages.length ? [{ key: "languages", icon: "translate", title: t("languages"), detail: languages.join(comma) }] : []),
            ...(geo?.city?.name ? [{ key: "place", icon: "pin", title: t("location"), detail: address }] : []),
        ];
        const rules = [
            ...(arrive ? [{ key: "arrive", term: t("checkin"), detail: t("after", { time: arrive }), icon: "door" }] : []),
            ...(leave ? [{ key: "leave", term: t("checkout"), detail: t("until", { time: leave }), icon: "luggage" }] : []),
            ...(product.min_stay && product.min_stay > 1 ? [{
                key: "stay", term: t("minimumStay"), detail: t("nights", { count: product.min_stay }), icon: "calendar",
            }] : []),
            ...productFacts(product.rules).map(( row ) => ({ ...row, detail: row.detail ?? "" })),
        ];
        const pois = (product.pois ?? []).flatMap(( row ) => {

            const spot = placePoint(row);
            const meters = point && spot ? metersBetween(point, spot) : null;

            return row.name ? [{ row, name: row.name, spot, meters }] : [];

        }).sort(( a, b ) => (a.meters ?? Infinity) - (b.meters ?? Infinity)).slice(0, 12).map(( { row, name, spot, meters } ) => ({
            key: String(row.id), name, kind: row.description ?? "", icon: "pin", spot,
            distance: meters === null ? null : distance(meters, locale),
        }));
        const origin = product.origin?.city?.name ?? product.origin?.geo?.name ?? null;
        const destination = product.destination?.city?.name ?? product.destination?.geo?.name ?? null;
        const ends = product.ends_at && Number.isFinite(Date.parse(product.ends_at)) ? new Date(product.ends_at) : null;
        const clock = ( value: Date | null ) => value ? day(value, locale, { hour: "numeric", minute: "2-digit" }) : null;
        const minutes = begins && ends ? Math.round((ends.getTime() - begins.getTime()) / 60000) : 0;
        const stock = typeof product.stock === "number" ? product.stock : null;
        const shipping = groups.find(( group ) => group.key === "shipping")?.items[0]?.detail ?? null;
        const stockOf = ( units: number | null ) => {

            if ( units === null ) return null;
            if ( units <= 0 ) return { tone: "danger" as const, label: t("outOfStock") };

            if ( units <= 10 ) return { tone: "warning" as const, label: t("fewLeft", { count: units }) };

            return { tone: "success" as const, label: t("inStock") };

        };
        const navigation = [
            { id: "overview", label: t("overview") },
            ...(family === "lodge" && rooms.length ? [{ id: "availability", label: t("availability") }] : []),
            ...(productFacts(product.features, true).length ? [{ id: "facilities", label: stay ? t("facilities") : t("features") }] : []),
            ...(groups.length ? [{ id: "details", label: t("details") }] : []),
            ...(rules.length || policies.length ? [{ id: "rules", label: stay ? t("houseRules") : t("thingsToKnow") }] : []),
            ...(pois.length ? [{ id: "location", label: t("location") }] : []),
            { id: "reviews", label: reviews ? t("reviewsCount", { count: reviews }) : t("reviews") },
            ...((product.faqs ?? []).length ? [{ id: "faqs", label: t("faqs") }] : []),
        ];

        return {
            failed: false as const,
            family,
            id: productId,
            path,
            locale,
            favorite: { productId, name: product.name, signIn: labels.card.signIn },
            share: { label: t("share"), copied: t("linkCopied"), failed: t("shareFailed") },
            header: {
                title: product.name,
                trail: { label: t("breadcrumb"), items: trail },
                kind: listing ? text(listing.title, locale) : null,
                rating: card.rating,
                reviews: reviews ? { href: "#reviews", label: t("reviewsCount", { count: reviews }) } : null,
                location: card.place,
                reserve: {
                    href: family === "lodge" && rooms.length ? "#availability" : "#booking",
                    label: family === "goods" ? booking("buy") : booking("reserve"),
                },
            },
            hero: {
                back: { href: back ?? home, label: t("back") },
                title: product.name,
                place: card.place,
                rating: card.rating ? { value: card.rating.value, label: card.rating.label } : null,
                reviews: reviews ? t("reviewsCount", { count: reviews }) : null,
                word: rating > 0 ? t(`score.${wordOf(rating)}`) : null,
                perks: bookingPerks({
                    from: asked.range.from, today: calendarToday(settings.locale.timeZone), hours: freeHours,
                    payLater: product.allow_pay_later === true, locale,
                }, ( key, values ) => booking(key, values)),
                amenities: productAmenities(product.features),
                room: lead?.price ? {
                    name: lead.name, brief: lead.brief, price: lead.price, currencyLabel: lead.currencyLabel,
                    unit: t("per", { unit: product.price_context?.unit ?? "" }), href: lead.select ?? "#availability",
                } : null,
                labels: { previous: common("previous"), next: common("next") },
            },
            nav: {
                label: t("sectionsLabel"),
                sections: navigation,
                price: card.price ? {
                    from: card.price.from, now: card.price.now, unit: card.price.unit,
                    currencyLabel: labels.view.currency(card.price.now.currency),
                } : null,
            },
            score: rating > 0 ? {
                value: decimal(rating, locale, 1) ?? String(rating),
                word: t(`score.${wordOf(rating)}`),
                detail: reviews ? t("reviewsCount", { count: reviews }) : t("noReviews"),
                label: card.rating?.label ?? t("noReviews"),
            } : null,
            place: address || map ? {
                title: t("location"), address, map: map ? { href: map, label: t("showMap") } : null,
                view: pin ? { ...atlas, point: { ...pin, label: geo?.city?.name ?? product.name } } : null,
            } : null,
            highlights: { title: family === "lodge" ? t("propertyHighlights") : t("highlights"), items: highlights },
            gallery: {
                direction: locale === "ar" ? "rtl" as const : "ltr" as const,
                layout: layouts[family],
                pictures: productPictures(product).map(( picture, index, list ) => ({
                    ...picture, label: t("photoPosition", { current: index + 1, total: list.length }),
                })),
                labels: {
                    title: t("photosTitle", { name: product.name }),
                    show: t("photos"), close: t("close"), previous: common("previous"), next: common("next"),
                },
            },
            overview: { title: t(`overviewTitles.${family}`), text: product.description, facts },
            amenities: {
                title: stay ? t("facilities") : t("features"),
                items: productFacts(product.features, true),
                more: t("allAmenities"),
                close: t("close"),
            },
            groups: groups.map(( group ) => ({
                ...group,
                title: known<Group>(sections, group.key) ? t(`groups.${group.key}`) : t("details"),
            })),
            rules: { title: stay ? t("houseRules") : t("thingsToKnow"), policies: t("policies"), items: rules, disclosures: policies },
            faqs: {
                title: t("faqs"),
                items: (product.faqs ?? []).flatMap(( row, index ) => row.question && row.answer
                    ? [{ key: row.key ?? String(index), title: row.question, body: row.answer }] : []),
            },
            rooms: {
                rooms,
                labels: {
                    from: t("from"),
                    unit: labels.card.unit(product.price_context?.unit ?? ""),
                    choose: t("choose"),
                    selected: t("selected"),
                    perks,
                    caption: t("roomsCaption", { name: product.name }),
                    columns: {
                        room: t("columns.room"),
                        sleeps: t("columns.sleeps"),
                        price: t("columns.price"),
                        choices: t("columns.choices"),
                        select: t("columns.select"),
                    },
                    taxes: t("taxesIncluded"),
                },
            },
            availabilityTitle: t("availability"),
            popularTitle: t("popularFacilities"),
            event: begins ? {
                month: day(begins, locale, { month: "short" }),
                day: day(begins, locale, { day: "numeric" }),
                weekday: day(begins, locale, { weekday: "short" }),
                label: day(begins, locale, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }),
            } : null,
            route: origin && destination ? {
                from: { place: origin, time: clock(begins), detail: product.origin?.country?.name ?? null },
                to: { place: destination, time: clock(ends), detail: product.destination?.country?.name ?? null },
                middle: minutes > 0
                    ? t("journey", { hours: Math.floor(minutes / 60), minutes: minutes % 60 })
                    : known<Mode>(modes, product.transport_mode) ? t(`modes.${product.transport_mode}`) : "",
                mode: product.transport_mode ?? null,
            } : null,
            service: family === "service" ? {
                mode: product.subtype === "online" ? t("online") : t("offline"),
                online: product.subtype === "online",
                steps: [
                    { key: "book", title: t("steps.book"), body: t("steps.bookBody") },
                    { key: "confirm", title: t("steps.confirm"), body: t("steps.confirmBody") },
                    {
                        key: "done",
                        title: t("steps.done"),
                        body: t(product.subtype === "online" ? "steps.onlineBody" : "steps.offlineBody"),
                    },
                ],
            } : null,
            document: family === "document" ? {
                steps: [
                    { key: "apply", title: t("apply.start"), body: t("apply.startBody") },
                    { key: "upload", title: t("apply.upload"), body: t("apply.uploadBody") },
                    { key: "review", title: t("apply.review"), body: span ? t("apply.reviewTime", { span }) : t("apply.reviewBody") },
                    { key: "receive", title: t("apply.receive"), body: t("apply.receiveBody") },
                ],
            } : null,
            guide: family === "ticket" ? {
                title: t("useTicket.title"),
                items: (["book", "receive", "enter"] as const).map(( key ) => ({
                    key, title: t(`useTicket.${key}`), body: t(`useTicket.${key}Body`),
                })),
            } : family === "insurance" ? {
                title: t("claims.title"),
                items: (["buy", "policy", "claim", "settle"] as const).map(( key ) => ({
                    key, title: t(`claims.${key}`), body: t(`claims.${key}Body`),
                })),
            } : null,
            goods: family === "goods" ? {
                stock: stockOf(stock),
                delivery: product.digital ? t("instantDelivery") : shipping,
                specs: [
                    ...(product.sku ? [{ key: "sku", term: t("sku"), detail: product.sku, icon: "tag" }] : []),
                    ...(product.delivery ? [{
                        key: "delivery",
                        term: t("deliveryMethod"),
                        detail: known<Delivery>(deliveries, product.delivery) ? t(`deliveries.${product.delivery}`) : product.delivery,
                        icon: "truck",
                    }] : []),
                    ...(stock !== null ? [{
                        key: "stock", term: t("availabilityLabel"), detail: count(stock, locale), icon: "package",
                    }] : []),
                ],
                seller: host?.name ?? null,
                secure: t("secure"),
                discount: card.price?.was ? card.badge ?? null : null,
            } : null,
            deal: effective && Number(effective.discount) > 0 ? {
                title: running?.name || deals(`kinds.${kind}`),
                body: deals("saving", {
                    amount: amountText(effective.discount, product.currency ?? "USD"),
                    base: amountText(effective.base, product.currency ?? "USD"),
                }),
                until: running?.expires_at
                    ? deals("endsOn", { date: day(running.expires_at, locale, { day: "numeric", month: "long" }) }) : null,
                href: offerScreen && effective.offer_id
                    ? localePath(locale, fillPattern(offerScreen.path, { offerId: String(effective.offer_id) }), routing) : null,
                action: deals("view"),
            } : null,
            parent: parent ? { name: parent.name ?? "", href: entityHref("product", parent, locale), label: t("partOf") } : null,
            similarTitle: t("similar"),
            bookingLabel: booking("label"),
            booking: {
                checkout: screenHref(placements("orders").find(( entry ) => entry.options.view === "checkout")?.screen, locale),
                initial,
                lead: lead?.id ?? null,
                productId,
                rooms: (product.sellables ?? []).map(( room ) => ({
                    id: room.id, name: room.name ?? "", soldOut: room.sold_out === true,
                    adults: room.adults, children: room.children, price: room.min_price,
                })),
                price: card.price,
                currency: product.currency ?? "USD",
                stay,
                dated: stay || abilities.has("has_availability") || abilities.has("schedulable"),
                starts: abilities.has("perishable") ? product.starts_at ?? null : null,
                closed: product.sale_closed === true,
                adults: product.adults,
                children: product.children,
                minimum: Math.max(1, product.min_quantity ?? 1),
                maximum: product.max_quantity || null,
                minStay: product.min_stay ?? 1,
                maxStay: product.max_stay || null,
                rating: card.rating,
                freeHours: freeHours ?? null,
                payLater: product.allow_pay_later === true,
                cart: screenHref(screens.find(( screen ) => screen.name === "cart"), locale),
            },
            summary: {
                title: card.place ? t("summary.place", { place: card.place }) : product.name,
                capacity: [
                    ...(product.capacity || product.adults ? [t("guestsCount", { count: product.capacity || product.adults || 0 })] : []),
                    ...productFacts(product.features)
                        .filter(( row ) => row.detail && measures.includes(row.key))
                        .map(( row ) => `${row.detail} ${row.term}`),
                ],
                favourite: rating >= 4.7 && reviews >= 3 ? t("summary.favourite") : null,
                host: host ? {
                    name: host.name ?? "",
                    title: t("summary.hostedBy", { name: host.name ?? "" }),
                    image: host.image,
                    detail: since ? t("memberSince", { date: since }) : null,
                    verified: host.verified ? t("verified") : null,
                } : null,
                highlights: highlights.slice(0, 3),
            },
            knowing: {
                title: t("thingsToKnow"),
                columns: [
                    {
                        key: "rules", title: t("houseRules"), icon: "door",
                        items: rules.slice(0, 5).map(( row ) => (row.detail ? `${row.term}: ${row.detail}` : row.term)),
                    },
                    {
                        key: "arrival", title: t("summary.arrival"), icon: "shield",
                        items: groups.flatMap(( group ) => group.items).slice(0, 5)
                            .map(( row ) => (row.detail ? `${row.term}: ${row.detail}` : row.term)),
                    },
                    {
                        key: "cancel", title: t("summary.cancellation"), icon: "calendar-check",
                        items: [
                            ...(freeHours ? [t("freeCancel", { hours: freeHours })] : []),
                            ...(flexible ? [] : [t("nonRefundable")]),
                            ...(product.allow_pay_later ? [t("payLaterBody")] : []),
                        ],
                    },
                ],
            },
            host: host ? {
                name: host.name ?? "",
                image: host.image,
                title: t("host", { name: host.name ?? "" }),
                detail: since ? t("memberSince", { date: since }) : null,
                verified: host.verified ? t("verified") : null,
                href: entityHref("vendor", host, locale),
                profile: t("viewProfile"),
            } : null,
            nearby: {
                title: t("nearby"), description: address ?? undefined, items: pois,
                map: pin ? {
                    ...atlas, label: t("nearby"),
                    points: [
                        { ...pin, label: t("thisPlace") },
                        ...pois.flatMap(( poi ) => poi.spot ? [{
                            ...poi.spot, key: poi.key, kind: "dot" as const, label: poi.name, title: poi.name, meta: poi.distance,
                            href: null,
                        }] : []),
                    ],
                } : null,
            },
            contact: {
                productId,
                label: t("messageHost"),
                failed: t("messageFailed"),
                links: {
                    messages: screens.find(( screen ) => screen.name === "messages")?.path ?? "/messages",
                    login: screens.find(( screen ) => screen.name === "login")?.path ?? "/login",
                },
            },
            reviewsTitle: reviews ? t("reviewsCount", { count: reviews }) : t("reviews"),
            rating,
            starsLabel: t("starsLabel", { rating: decimal(rating, locale, 1) ?? String(rating) }),
            reviewPage: queryNumber(route.query, "reviews", 1, 10000) ?? 1,
        };

    }
    catch {

        return { failed: true as const, failure };

    }

}

export type DetailData = Extract<Awaited<ReturnType<typeof detail>>, { failed: false }>;
