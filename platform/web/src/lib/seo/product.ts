import type { Data } from "@/api/features";
import { type Json, pruned } from "@/lib/std/json";
import { plainText } from "@/lib/std/text";
import { webUrl } from "@/lib/std/url";

type Product = Data<"products", "view">;
type Location = NonNullable<Product["geo"]>;
type Facts = Record<string, Json>;
type Has = ( capability: string ) => boolean;
type Rule = { type: string; fits: ( product: Product, has: Has ) => boolean; facts: ( product: Product, url: string ) => Facts; };

function traitsOf ( product: Product ) {

    const features = product.features;

    if ( !features ) return [];

    return Array.isArray(features) ? features : Object.values(features).flatMap(( group ) => group ?? []);

}
function offersOf ( product: Product, url: string ): Json {

    const money = product.min_price;
    const price = typeof money === "object" && money ? money.display ?? money : null;
    const amount = Number(price?.amount);

    if ( !price?.currency || price.amount === null || price.amount === undefined || !Number.isFinite(amount) || amount < 0 ) return null;

    const range = !!product.sellables?.length;

    return {
        "@type": range ? "AggregateOffer" : "Offer",
        url,
        priceCurrency: price.currency,
        availability: `https://schema.org/${product.sale_closed || product.stock === 0 ? "OutOfStock" : "InStock"}`,
        ...(range ? { lowPrice: String(price.amount) } : { price: String(price.amount) }),
    };

}
export function postalAddress ( parts: Readonly<Record<string, Json | undefined>> ): Json {

    const found = pruned(parts);

    return Object.keys(found).length ? { "@type": "PostalAddress", ...found } : null;

}
function address ( geo: Location ): Json {

    return postalAddress({ streetAddress: geo.address, postalCode: geo.zip_code, addressLocality: geo.city?.name, addressCountry: geo.country?.code });

}
function coordinates ( geo: Location ): Json {

    const latitude = Number(geo.latitude);
    const longitude = Number(geo.longitude);

    if ( geo.latitude === null || geo.latitude === undefined || !Number.isFinite(latitude) || !Number.isFinite(longitude) ) return null;

    return { "@type": "GeoCoordinates", latitude, longitude };

}
function located ( product: Product ): Facts {

    return product.geo ? pruned({ address: address(product.geo), geo: coordinates(product.geo) }) : {};

}
function place ( product: Product, url: string ): Json {

    if ( product.subtype === "online" ) return { "@type": "VirtualLocation", url };

    return { "@type": "Place", name: product.geo?.city?.name ?? product.name, ...located(product) };

}
function offered ( product: Product, url: string ): Facts {

    return pruned({ offers: offersOf(product, url) });

}
function event ( product: Product, url: string ): Facts {

    return pruned({
        startDate: product.starts_at,
        endDate: product.ends_at,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: `https://schema.org/${product.subtype === "online" ? "Online" : "Offline"}EventAttendanceMode`,
        location: place(product, url),
        ...offered(product, url),
    });

}
function lodging ( product: Product ): Facts {

    const traits = traitsOf(product);
    const stars = Number(traits.find(( trait ) => trait.key === "star_rating")?.number);
    const amenities = traits
        .filter(( trait ) => trait.group === "amenities" && trait.included !== false && trait.label)
        .map(( trait ) => ({ "@type": "LocationFeatureSpecification", name: String(trait.label), value: true }));

    return pruned({
        ...located(product),
        telephone: product.phone,
        checkinTime: product.checkin_time,
        checkoutTime: product.checkout_time,
        starRating: stars > 0 && stars <= 5 ? { "@type": "Rating", ratingValue: stars } : null,
        amenityFeature: amenities.length ? amenities : null,
    });

}
function item ( product: Product, url: string ): Facts {

    const brand = traitsOf(product).find(( trait ) => trait.key === "brand");
    const name = brand?.value_label ?? brand?.value;

    return pruned({ sku: product.sku, brand: name ? { "@type": "Brand", name: String(name) } : null, ...offered(product, url) });

}
function dated ( product: Product, has: Has ): boolean {

    return !!product.starts_at && (has("perishable") || (has("has_location") && !has("schedulable")));

}
function rating ( product: Product ): Facts {

    const value = Number(product.rating);
    const count = product.reviews ?? 0;

    if ( count <= 0 || !(value > 0 && value <= 5) ) return {};

    return { aggregateRating: { "@type": "AggregateRating", ratingValue: value, reviewCount: count, bestRating: 5, worstRating: 1 } };

}

const rules: readonly Rule[] = [
    { type: "Event", fits: ( product, has ) => dated(product, has), facts: event },
    { type: "LodgingBusiness", fits: ( _, has ) => has("lodging") && !has("has_parent"), facts: lodging },
    { type: "Trip", fits: ( _, has ) => has("transport"), facts: offered },
    { type: "TouristTrip", fits: ( _, has ) => has("schedulable") && has("has_location"), facts: offered },
    { type: "Product", fits: ( _, has ) => has("purchasable"), facts: item },
    { type: "Service", fits: ( _, has ) => has("bookable"), facts: offered },
];
export function productEntity ( product: Product, url: string ): Json {

    const has: Has = ( capability ) => !!product.capabilities?.includes(capability);
    const rule = rules.find(( candidate ) => candidate.fits(product, has));
    const image = webUrl(product.image);

    if ( !rule ) return null;

    return {
        "@type": rule.type,
        "@id": `${url}#entity`,
        name: plainText(product.name),
        url,
        description: plainText(product.description),
        ...(image ? { image: [image] } : {}),
        ...rule.facts(product, url),
        ...rating(product),
    };

}
