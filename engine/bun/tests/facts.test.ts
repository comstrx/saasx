import { describe, expect, test } from "bun:test";
import { post } from "engine/api";
import { bindingShape, catalogueFacts } from "engine/spec";
import { z } from "engine/validate";

const item = z.object({ id: z.number() });
describe("operation facts over nested inputs", () => {

    test("the input names carry the dotted leaves, so a write may bind them as fields", () => {

        const facts = catalogueFacts({
            people: {
                save: post(
                    "/people",
                    { name: z.string(), address: z.object({ city: z.string(), zip: z.string().optional() }) },
                    item,
                ),
            },
        });

        expect(facts.people?.save?.input).toEqual(["name", "address", "address.city", "address.zip"]);
        expect(facts.people?.save?.fields.map(( field ) => field.name)).toEqual(["name", "address.city", "address.zip"]);

    });

});
describe("write bindings", () => {

    test("fields take dotted leaves and refuse anything else", () => {

        expect(z.safeParse(bindingShape, { write: "people.save", fields: ["name", "address.city"] }).success).toBe(
            true,
        );
        expect(z.safeParse(bindingShape, { write: "people.save", fields: ["address."] }).success).toBe(false);
        expect(z.safeParse(bindingShape, { write: "people.save", fields: ["address[city]"] }).success).toBe(false);

    });

});
