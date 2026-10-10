import type { z } from "../../lib/providers/schema.ts";
import { keysOf, mapValues } from "../../lib/std/object.ts";
import type { ApiClient } from "../core/client.ts";
import { document, type Endpoint, factsOf } from "../core/dsl.ts";
import account from "./account.ts";
import articles from "./articles.ts";
import auth from "./auth.ts";
import broadcast from "./broadcast.ts";
import campaigns from "./campaigns.ts";
import cart from "./cart.ts";
import categories from "./categories.ts";
import chat, { announcementMessages, announcements, messages, observe, supportMessages } from "./chat.ts";
import coupons from "./coupons.ts";
import credentials from "./credentials.ts";
import documents from "./documents.ts";
import favorites from "./favorites.ts";
import footer from "./footer.ts";
import gateways from "./gateways.ts";
import geos, { cities, countries, districts, regions } from "./geos.ts";
import header from "./header.ts";
import home from "./home.ts";
import hub from "./hub.ts";
import levels from "./levels.ts";
import loader from "./loader.ts";
import locales, { currencies } from "./locales.ts";
import logs, { reports } from "./logs.ts";
import menu from "./menu.ts";
import nav from "./nav.ts";
import notice from "./notice.ts";
import notifications from "./notifications.ts";
import offers from "./offers.ts";
import orders from "./orders.ts";
import plans from "./plans.ts";
import pois from "./pois.ts";
import policy from "./policy.ts";
import products from "./products.ts";
import promo from "./promo.ts";
import promotions from "./promotions.ts";
import referrals from "./referrals.ts";
import reviews, { comments, replies } from "./reviews.ts";
import rewards from "./rewards.ts";
import search from "./search.ts";
import sessions from "./sessions.ts";
import sitemap, { type sitemapKinds } from "./sitemap.ts";
import subscriptions from "./subscriptions.ts";
import tenants from "./tenants.ts";
import tickets from "./tickets.ts";
import transactions from "./transactions.ts";
import vendors from "./vendors.ts";
import wallet from "./wallet.ts";
import welcome from "./welcome.ts";

export const endpoints = {
    auth,
    account,
    sessions,
    credentials,
    documents,
    locales,
    currencies,
    content: document("content", "/content/site-info", {
        execution: "hybrid",
        response: {
            fields: {
                address_line1: "address",
                address_line2: "geo.address_2",
                city: "geo.city.name",
                country: "geo.country.name",
                country_code: "geo.country.code",
                postal_code: "zip_code",
            },
        },
    }),
    settings: document("settings", "/content/site-info", { execution: "hybrid", response: { fields: { time_zone: "timezone" } } }),
    seo: document("seo", "/content/seo/{path}", {
        response: { fields: { published_at: "created_at", modified_at: "updated_at" } },
    }),
    sitemap,
    policy,
    nav,
    menu,
    notice,
    welcome,
    footer,
    loader,
    header,
    home,
    hub,
    search,
    articles,
    offers,
    campaigns,
    plans,
    products,
    promo,
    categories,
    vendors,
    geos,
    countries,
    regions,
    cities,
    districts,
    pois,
    reviews,
    comments,
    replies,
    reports,
    logs,
    orders,
    cart,
    gateways,
    wallet,
    transactions,
    subscriptions,
    tenants,
    promotions,
    tickets,
    broadcast,
    notifications,
    favorites,
    coupons,
    levels,
    referrals,
    rewards,
    chat,
    messages,
    supportMessages,
    announcements,
    announcementMessages,
    observe,
};

export const entities = {
    product: { parameter: "productId", feed: "catalogs", article: false, view: ( api, id ) => api.products.view({ productId: id }) },
    article: { parameter: "articleId", feed: "blogs", article: true, view: ( api, id ) => api.articles.view({ articleId: id }) },
    category: { parameter: "categoryId", feed: "categories", article: false, view: ( api, id ) => api.categories.view({ categoryId: id }) },
    geo: { parameter: "geoId", feed: "geos", article: false, view: ( api, id ) => api.geos.view({ geoId: id }) },
    vendor: { parameter: "vendorId", feed: "vendors", article: false, view: ( api, id ) => api.vendors.view({ vendorId: id }) },
} satisfies Record<string, EntityRow>;
export const entityKinds = keysOf(entities);

const facts = mapValues(endpoints, ( operations ) => factsOf(operations));

export const permissions: Record<Feature, readonly string[]> = mapValues(facts, ( fact ) => fact.permissions);
export const touches: Record<Feature, readonly Feature[]> = mapValues(facts, ( fact ) => fact.touches as readonly Feature[]);

type EntityRow = { parameter: string; feed: SitemapKind; article: boolean; view: ( api: ApiClient, id: number ) => Promise<unknown> };

export type Endpoints = typeof endpoints;
export type Feature = keyof Endpoints;
export type EndpointOf<F extends Feature, O extends keyof Endpoints[F]> = Endpoints[F][O] extends Endpoint ? Endpoints[F][O] : never;
export type EntityKind = keyof typeof entities;
export type Entity<K extends EntityKind> = Awaited<ReturnType<typeof entities[K]["view"]>>["resource"];
export type SitemapKind = typeof sitemapKinds[number];
export type Data<F extends Feature, O extends keyof Endpoints[F]> = Endpoints[F][O] extends { output: infer T extends z.ZodType }
    ? z.output<T>
    : never;
