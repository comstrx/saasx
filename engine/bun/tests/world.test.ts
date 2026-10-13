import { describe, expect, test } from "bun:test";
import { fold } from "@engine/string";
import { countries, currencies, defineWorld, flagEmoji, languages } from "@engine/world";

const world = defineWorld();

describe("the whole world", () => {

    test("every country names its currencies and languages in the tables and carries three names", () => {

        expect(countries.length).toBeGreaterThan(240);

        for ( const country of countries ) {

            expect(country.name.en && country.name.ar && country.name.native).toBeTruthy();

            for ( const code of country.currencies ) expect(world.currencies.has(code)).toBe(true);
            for ( const code of country.languages ) expect(world.languages.has(code)).toBe(true);

        }

        expect(currencies.every(( c ) => c.countries.every(( alpha2 ) => world.countries.has(alpha2)))).toBe(true);
        expect(languages.find(( l ) => l.code === "ar")?.direction).toBe("rtl");

    });
    test("a country is found by any of its names, codes or dialing code, exact matches first", () => {

        expect(world.countries.search("مصر")[0]?.alpha2).toBe("EG");
        expect(world.countries.search("مِصْر")[0]?.alpha2).toBe("EG");
        expect(world.countries.search("egypt")[0]?.alpha2).toBe("EG");
        expect(world.countries.search("EGY")[0]?.alpha2).toBe("EG");
        expect(world.countries.search("+20")[0]?.alpha2).toBe("EG");
        expect(world.countries.search("Côte")[0]?.alpha2).toBe("CI");
        expect(world.countries.search("cote d")[0]?.alpha2).toBe("CI");
        expect(world.countries.search("السعوديه")[0]?.alpha2).toBe("SA");
        expect(world.countries.search("zzzz")).toEqual([]);
        expect(world.countries.search("")).toEqual([]);

    });
    test("a currency is found by code, symbol, any name, or the country that spends it", () => {

        expect(world.currencies.search("ريال سعودي")[0]?.code).toBe("SAR");
        expect(world.currencies.search("السعودية")[0]?.code).toBe("SAR");
        expect(world.currencies.search("$")[0]?.code).toBe("USD");
        expect(world.currencies.search("Egyptian")[0]?.code).toBe("EGP");
        expect(world.currencies.search("eg").some(( c ) => c.code === "EGP")).toBe(true);
        expect(world.currenciesOf("eg").map(( c ) => c.code)).toEqual(["EGP"]);
        expect(world.countriesOf("SAR").map(( c ) => c.alpha2)).toEqual(["SA"]);
        expect(world.currencies.get("usd")?.digits).toBe(2);
        expect(world.currencies.get("JPY")?.digits).toBe(0);

    });
    test("dialing searches by digits however they are typed", () => {

        expect(world.dialing.search("+2 0").map(( c ) => c.alpha2)).toContain("EG");
        expect(world.dialing.search("966")[0]?.alpha2).toBe("SA");
        expect(world.dialing.of("sa")).toBe("+966");
        expect(world.dialing.search("")).toEqual([]);

    });

});
describe("a surface's world", () => {

    test("a filter keeps only what the backend supports, in the order given, and refuses strangers", () => {

        const mine = defineWorld({ countries: ["sa", "EG"], currencies: ["SAR", "EGP", "USD"], languages: ["ar", "en"] });

        expect(mine.countries.all.map(( c ) => c.alpha2)).toEqual(["SA", "EG"]);
        expect(mine.countries.search("egypt")).toHaveLength(1);
        expect(mine.countries.search("france")).toEqual([]);
        expect(mine.currencies.all.map(( c ) => c.code)).toEqual(["SAR", "EGP", "USD"]);
        expect(mine.currenciesOf("US")).toEqual([]);
        expect(mine.languages.all.map(( l ) => l.code)).toEqual(["ar", "en"]);
        expect(() => defineWorld({ countries: ["XX"] })).toThrow("Unknown countries: XX");

    });
    test("flags follow the surface's folder and format, and the emoji falls out of the code", () => {

        expect(defineWorld().flagOf("EG")).toBe("images/flag/eg.svg");
        expect(defineWorld({ flags: { format: "webp" } }).flagOf("sa")).toBe("images/flag/sa.webp");
        expect(defineWorld({ flags: { folder: "/images/flag" } }).flagOf("AE")).toBe("/images/flag/ae.svg");
        expect(flagEmoji("EG")).toBe("🇪🇬");
        expect(flagEmoji("e")).toBe("");
        expect(fold("Côte d'Ivoire")).toBe("cote d'ivoire");

    });

});
