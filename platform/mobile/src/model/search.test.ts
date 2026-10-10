import { emptySupports, initialSearchQuery, searchTerms, sortOf, sortsFor } from "@/model/search";

const dated = { ...initialSearchQuery(), checkin: "2026-10-01", checkout: "2026-10-04", adults: 2, children: 1, rooms: 1 };

describe("search terms", () => {

    test("a dated stay search carries the party its rooms must fit", () => {

        const terms = searchTerms(dated, 1);

        expect(terms).toContain("filters[checkin]=2026-10-01");
        expect(terms).toContain("filters[rooms]=1");
        expect(terms).toContain("filters[adults]=2");
        expect(terms).toContain("filters[children]=1");

    });

    test("an undated search sends no party, so a listing without rooms is never filtered out", () => {

        const terms = searchTerms({ ...dated, checkin: "", checkout: "" }, 1);

        expect(terms).not.toContain("filters[adults]");
        expect(terms).not.toContain("filters[children]");
        expect(terms).not.toContain("filters[rooms]");

    });

});

describe("search order", () => {

    const browse = initialSearchQuery();
    const typed = { ...browse, term: "Red Sea Dive Cover" };

    test("a text search ranks by relevance until the member picks an order", () => {

        expect(sortOf(typed)).toBe("relevance");
        expect(searchTerms(typed, 1)).toContain("sort=relevance");
        expect(sortOf({ ...typed, sort: "lowest_price" })).toBe("lowest_price");

    });

    test("browsing keeps our picks, and relevance never outlives its text", () => {

        expect(sortOf(browse)).toBe("recommended");
        expect(sortOf({ ...browse, sort: "relevance" })).toBe("recommended");
        expect(sortsFor(browse, emptySupports)).not.toContain("relevance");
        expect(sortsFor(typed, emptySupports)).toContain("relevance");

    });

    test("the sheet offers only the orders the server publishes", () => {

        expect(sortsFor(typed, { ...emptySupports, sorts: [ "relevance", "newest" ] })).toEqual([ "relevance", "newest" ]);

    });

});
