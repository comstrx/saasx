import { describe, expect, test } from "bun:test";
import { entityRoute, entityShape, screenShapes } from "engine/spec";
import { z } from "engine/validate";

const entities = { product: { parameter: "productId" } };
const options = z.strictObject({ title: z.boolean() });
const block = z.strictObject({ gap: z.number() });

describe("schema shapes", () => {

    test("entities are known kinds and routes pick the right parameter", () => {

        expect(entityShape(entities).safeParse("product").success).toBe(true);
        expect(entityShape(entities).safeParse("order").success).toBe(false);
        expect(entityRoute(entities, { entity: "product", path: "/p/:productId" })).toEqual({
            path: "/p/:productId",
            kind: "product",
            parameter: "productId",
        });
        expect(entityRoute(entities, { entity: { kind: "product", parameter: "slug" }, path: "/p" })?.parameter).toBe(
            "slug",
        );
        expect(entityRoute(entities, { path: "/" })).toBeNull();

    });
    test("a surface's screen shape carries shared contents plus its extras", () => {

        const { schema } = screenShapes(options, block, entities, { description: z.string() });
        const parsed = schema.safeParse({
            screens: [
                {
                    contents: { name: "home", path: "/", title: "Home", description: "d" },
                    options: { title: false },
                    blocks: [],
                },
            ],
        });

        expect(parsed.success).toBe(true);
        expect(
            schema.safeParse({ screens: [{ contents: { name: "home", path: "/", title: "Home" }, blocks: [] }] })
                .success,
        ).toBe(false);

    });

});
