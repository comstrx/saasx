import assert from "node:assert/strict";
import { test } from "node:test";
import { distance } from "../../src/lib/std/format.ts";
import { currencyOf, formatPoint, isCountry, isCurrency, isPoint, metersBetween, parsePoint, placePoint } from "../../src/lib/std/geo.ts";

test("a point parses only from two in-range coordinates", () => {

    assert.deepEqual(parsePoint("24.71360,46.67530"), { latitude: 24.7136, longitude: 46.6753 });
    assert.deepEqual(parsePoint("0,0"), { latitude: 0, longitude: 0 });
    assert.equal(parsePoint("91,0"), undefined);
    assert.equal(parsePoint("0,181"), undefined);
    assert.equal(parsePoint(","), undefined);
    assert.equal(parsePoint("1,2,3"), undefined);
    assert.equal(parsePoint("denied"), undefined);
    assert.equal(parsePoint(undefined), undefined);
    assert.equal(isPoint({ latitude: Number.NaN, longitude: 0 }), false);

});
test("a point round-trips through its cookie form", () => {

    assert.equal(formatPoint({ latitude: 24.713612345, longitude: -46.67534 }), "24.71361,-46.67534");
    assert.deepEqual(parsePoint(formatPoint({ latitude: -33.86882, longitude: 151.20929 })), { latitude: -33.86882, longitude: 151.20929 });

});
test("a country maps to the currency it spends", () => {

    assert.equal(currencyOf("SA"), "SAR");
    assert.equal(currencyOf("EG"), "EGP");
    assert.equal(currencyOf("AE"), "AED");
    assert.equal(currencyOf("US"), "USD");
    assert.equal(currencyOf("DE"), "EUR");
    assert.equal(currencyOf("BG"), "EUR");
    assert.equal(currencyOf("CW"), "XCG");
    assert.equal(currencyOf("AQ"), undefined);

});
test("only assigned country codes are countries", () => {

    assert.equal(isCountry("SA"), true);
    assert.equal(isCountry("XK"), true);
    assert.equal(isCountry("sa"), false);
    assert.equal(isCountry("XX"), false);
    assert.equal(isCountry("T1"), false);
    assert.equal(isCountry(undefined), false);

});
test("every mapped currency is one the runtime can format", () => {

    const known = new Set(Intl.supportedValuesOf("currency"));
    const letters = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
    const codes = letters.flatMap(( first ) => letters.map(( second ) => `${first}${second}`));
    const mapped = codes.map(( code ) => currencyOf(code)).filter(( currency ) => currency !== undefined);

    assert.equal(mapped.length, 249);
    assert.deepEqual(mapped.filter(( currency ) => !known.has(currency)), []);

});
test("a currency code is three capital letters", () => {

    assert.deepEqual(["SAR", "sar", "SA", "SARS", "S4R", undefined, 7].map(( value ) => isCurrency(value)), [true, false, false, false, false, false, false]);

});
test("a place resolves its own point first, then its city's, never a null island", () => {

    assert.deepEqual(placePoint({ latitude: "25.67", longitude: "32.64" }), { latitude: 25.67, longitude: 32.64 });
    assert.deepEqual(placePoint({ city: { latitude: 30.04, longitude: 31.23 } }), { latitude: 30.04, longitude: 31.23 });
    assert.equal(placePoint({ latitude: 0, longitude: 0 }), null);
    assert.equal(placePoint({ latitude: "north", longitude: 1 }), null);
    assert.equal(placePoint(null), null);

});
test("the distance between two points is measured along the earth and spoken in its unit", () => {

    const luxor = { latitude: 25.6735695, longitude: 32.6409734 };

    assert.equal(Math.round(metersBetween(luxor, luxor)), 0);
    assert.equal(Math.round(metersBetween(luxor, { latitude: 25.6747532, longitude: 32.6413097 }) / 10) * 10, 140);
    const [riyadh, mecca] = [{ latitude: 24.7136, longitude: 46.6753 }, { latitude: 21.4858, longitude: 39.1925 }];

    assert.equal(Math.round(metersBetween(riyadh, mecca) / 1000), 845);
    assert.equal(distance(138, "en"), "140 m");
    assert.equal(distance(4, "en"), "10 m");
    assert.equal(distance(1640, "en"), "1.6 km");

});
