import { en } from "@/brand/i18n/locales/en";

const arabic = /[؀-ۿ]/u;

const leaves = ( node: unknown, path: string ): readonly [ string, string ][] =>
    typeof node === "string"
        ? [ [ path, node ] ]
        : node && typeof node === "object"
            ? Object.entries(node).flatMap(([ key, value ]) => leaves(value, path ? `${ path }.${ key }` : key))
            : [];

describe("the english bundle", () => {

    test("carries no arabic script", () => {

        const leaked = leaves(en, "").filter(( leaf ) => arabic.test(leaf[1]) ).map(( leaf ) => leaf[0] );

        expect(leaked).toEqual([]);

    });

});
