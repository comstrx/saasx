import { type PasswordPolicy, rules, strong } from "@/std/password";

const served: PasswordPolicy = { min: 6, max: 255, lower: true, upper: true, digit: true, symbol: true };

describe("password policy", () => {

    test("the rules follow the served policy, never a fixed list", () => {

        expect(rules("abc", served).map(( rule ) => rule.key )).toEqual([ "length", "upper", "lower", "digit", "symbol" ]);
        expect(rules("abc", { ...served, upper: false, symbol: false }).map(( rule ) => rule.key )).toEqual([ "length", "lower", "digit" ]);

    });

    test("an underscore counts as a symbol, the way the server reads it", () => {

        expect(strong("Abcde1_", served)).toBe(true);
        expect(strong("Abcdef1", served)).toBe(false);

    });

    test("the length rule holds both bounds", () => {

        expect(strong("Ab1!", { ...served, min: 4, max: 4 })).toBe(true);
        expect(strong("Ab1!x", { ...served, min: 4, max: 4 })).toBe(false);

    });

});
