import { listingRow } from "@/api/endpoints/catalogs";
import { listingOf } from "@/model/catalog";

const served = ( images: unknown ) => listingOf(listingRow.parse({ id: 1, name: "Sofitel", type: "hotel", image: "https://cdn.test/lead.jpg", images }));

describe("listing photos", () => {

    test("a light row pages every photo the server sends, lead first", () => {

        const listing = served([
            { url: "https://cdn.test/lead.jpg", variants: { 320: "https://cdn.test/lead_320.webp" } },
            { url: "https://cdn.test/pool.jpg", variants: null },
        ]);

        expect(listing.images.map(( shot ) => shot.uri )).toEqual([ "https://cdn.test/lead.jpg", "https://cdn.test/pool.jpg" ]);

    });

    test("a row without a gallery still shows its lead photo", () => {

        expect(served(undefined).images.map(( shot ) => shot.uri )).toEqual([ "https://cdn.test/lead.jpg" ]);

    });

});

describe("listing sale", () => {

    const priced = ( extra: Record<string, unknown> ) => listingOf(listingRow.parse({ id: 1, name: "Sofitel", type: "hotel", min_price: { amount: "187.20", currency: "USD" }, ...extra }));

    test("a row on offer carries the server's own sale on its own floor", () => {

        const listing = priced({ offer: { rate: "15.0000" }, sale_price: { amount: "159.12", currency: "USD" } });

        expect(listing.price).toEqual({ amount: 187.2, currency: "USD" });
        expect(listing.sale).toEqual({ amount: 159.12, currency: "USD" });

    });

    test("a row without an offer never shows a sale, even if a price rides along", () => {

        expect(priced({ sale_price: { amount: "187.20", currency: "USD" } }).sale).toBeNull();
        expect(priced({ offer: [] }).sale).toBeNull();

    });

});
