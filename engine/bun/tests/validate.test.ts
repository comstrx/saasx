import { describe, expect, test } from "bun:test";
import { assert, email, fieldFacts, issuesOf, localized, parse, password, phone, shapeKeys, z } from "@engine/validate";

describe("validate", () => {
    test("parse answers field errors as an input failure", () => {
        const result = parse(z.object({ email, phone }), { email: "x", phone: "1" });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.failure.kind).toBe("input");
            expect(Object.keys(result.failure.errors).sort()).toEqual(["email", "phone"]);
        }
        expect(() => assert(z.number(), "x")).toThrow();
    });
    test("issues map to dotted paths and shape keys list an object schema", () => {
        const result = z.object({ a: z.object({ b: z.number() }) }).safeParse({ a: { b: "x" } });

        expect(result.success).toBe(false);
        if (!result.success) expect(issuesOf(result.error)).toEqual({ "a.b": [expect.any(String)] });
        expect(shapeKeys(z.object({ x: z.number(), y: z.string() }))).toEqual(["x", "y"]);
        expect(shapeKeys(z.string())).toEqual([]);
    });
});

describe("fieldFacts", () => {
    test("reads the kind, requirement and bounds of every input field", () => {
        const facts = fieldFacts(
            z.object({
                name: z.string().min(2).max(50),
                type: z.enum(["hotel", "room"]),
                stock: z.number().int().positive().optional(),
                featured: z.boolean().nullish(),
                starts: z.iso.date().optional(),
                at: z.iso.datetime({ offset: true }).optional(),
                email: email.optional(),
                phone: phone.optional(),
                secret: password,
                title: localized(),
                image: z.file().optional(),
                tags: z.array(z.string()).optional(),
                extra: z.object({ a: z.string() }).optional(),
                id: z.coerce.number().int().positive(),
                page: z.number().default(1),
            }),
        );
        const byName = Object.fromEntries(facts.map((fact) => [fact.name, fact]));

        expect(facts.map((fact) => fact.name)).toEqual([
            "name",
            "type",
            "stock",
            "featured",
            "starts",
            "at",
            "email",
            "phone",
            "secret",
            "title",
            "image",
            "tags",
            "extra",
            "id",
            "page",
        ]);
        expect(byName.name).toEqual({ name: "name", kind: "text", required: true, nullable: false, min: 2, max: 50 });
        expect(byName.type).toEqual({
            name: "type",
            kind: "choice",
            required: true,
            nullable: false,
            choices: ["hotel", "room"],
        });
        expect(byName.stock).toEqual({ name: "stock", kind: "integer", required: false, nullable: false, min: 1 });
        expect(byName.featured).toEqual({ name: "featured", kind: "boolean", required: false, nullable: true });
        expect(byName.starts?.kind).toBe("date");
        expect(byName.at?.kind).toBe("datetime");
        expect(byName.email?.kind).toBe("email");
        expect(byName.phone?.kind).toBe("phone");
        expect(byName.secret?.kind).toBe("password");
        expect(byName.title?.kind).toBe("localized");
        expect(byName.image?.kind).toBe("file");
        expect(byName.tags?.kind).toBe("list");
        expect(byName.extra?.kind).toBe("object");
        expect(byName.id).toEqual({ name: "id", kind: "integer", required: true, nullable: false, min: 1 });
        expect(byName.page).toEqual({ name: "page", kind: "number", required: false, nullable: false });
    });
    test("a non-object schema has no fields", () => {
        expect(fieldFacts(z.string())).toEqual([]);
    });
});
