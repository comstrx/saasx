import { identity } from "@/brand/identity";

const hello = ( name: string ): string => `hello ${ name }`;

describe("hello", () => {

    test("greets the brand through the @/ alias", () => {

        expect(identity.name).toBeTruthy();
        expect(hello(identity.name)).toBe(`hello ${ identity.name }`);

    });

});
