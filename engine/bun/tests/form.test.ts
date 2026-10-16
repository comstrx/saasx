import { describe, expect, test } from "bun:test";
import { createForm, fieldLabel, formText, localizedTexts, withTranslations } from "engine/client";
import { Failure } from "engine/error";
import type { FieldFact } from "engine/validate";

const fields: FieldFact[] = [
    { name: "name", kind: "text", required: true, nullable: false, min: 2 },
    { name: "stock", kind: "integer", required: false, nullable: false },
    { name: "featured", kind: "boolean", required: false, nullable: false },
    { name: "type", kind: "choice", required: true, nullable: false, choices: ["hotel", "room"] },
    { name: "title", kind: "localized", required: false, nullable: false },
    { name: "starts", kind: "date", required: false, nullable: true },
    { name: "kind", kind: "choice", required: false, nullable: false, choices: ["x", "y"] },
];

describe("form", () => {

    test("starts from the field facts, loads a record and coerces values on submit", async () => {

        const sent: unknown[] = [];
        const form = createForm({
            fields,
            locales: ["en", "ar"],
            submit: async ( values ) => {

                sent.push(values);

                return { id: 1 };

            },
        });

        expect(form.getState().values).toEqual({
            name: "",
            stock: "",
            featured: false,
            type: "hotel",
            title: { en: "", ar: "" },
            starts: "",
            kind: "",
        });
        form.getState().load({
            id: 9,
            name: "Walk",
            stock: 5,
            featured: true,
            type: "room",
            title: { en: "A" },
            starts: "2026-12-01T00:00:00+00:00",
            extra: 1,
        });
        expect(form.getState().values).toEqual({
            name: "Walk",
            stock: "5",
            featured: true,
            type: "room",
            title: { en: "A", ar: "" },
            starts: "2026-12-01",
            kind: "",
        });
        expect(form.getState().dirty).toBe(false);
        form.getState().set("name", "Walk Hotel");
        form.getState().set("title", { en: "A", ar: "ب" });
        expect(form.getState().dirty).toBe(true);
        await form.getState().submit();
        expect(sent[0]).toEqual({
            name: "Walk Hotel",
            stock: 5,
            featured: true,
            type: "room",
            title: { en: "A", ar: "ب" },
            starts: "2026-12-01",
        });
        expect(form.getState().status).toBe("done");
        expect(form.getState().result).toEqual({ id: 1 });
        expect(form.getState().dirty).toBe(false);

    });
    test("keeps one idempotency key across retries of the same values and renews it after a change", async () => {

        const keys: string[] = [];
        let fail = true;
        const form = createForm({
            fields,
            locales: ["en"],
            submit: async ( _values, { idempotencyKey } ) => {

                keys.push(idempotencyKey);

                if ( fail ) throw new Failure("network");

                return null;

            },
        });

        form.getState().set("name", "ab");
        await form.getState().submit();
        expect(form.getState().status).toBe("failed");
        await form.getState().submit();
        expect(keys[0]).toBe(keys[1]);
        form.getState().set("name", "abc");
        fail = false;
        await form.getState().submit();
        expect(keys[2]).not.toBe(keys[1]);
        await form.getState().submit();
        expect(keys[3]).not.toBe(keys[2]);

    });
    test("field errors come from the failure, strangers under the form, and clear on edit", async () => {

        const form = createForm({
            fields,
            locales: ["en"],
            submit: async () => {

                throw new Failure("input", { errors: { name: ["too short"], stranger: ["x"] } });

            },
        });

        await form.getState().submit();
        expect(form.getState().errors).toEqual({ name: "too short", _form: "x" });
        form.getState().set("name", "abcd");
        expect(form.getState().errors).toEqual({ _form: "x" });
        form.getState().reset();
        expect(form.getState()).toMatchObject({ status: "idle", errors: {}, dirty: false });

    });

});
describe("list fields", () => {

    test("a list starts empty, loads its items as text and is omitted when empty", async () => {

        const sent: unknown[] = [];
        const form = createForm({
            fields: [{ name: "tags", kind: "list", required: false, nullable: false }],
            locales: ["en"],
            submit: async ( values ) => {

                sent.push(values);

                return null;

            },
        });

        expect(form.getState().values.tags).toEqual([]);
        form.getState().load({ tags: ["a", 2] });
        expect(form.getState().values.tags).toEqual(["a", "2"]);
        await form.getState().submit();
        form.getState().set("tags", []);
        await form.getState().submit();
        expect(sent).toEqual([{ tags: ["a", "2"] }, {}]);

    });

});
describe("localized fields", () => {

    test("a plain string lands in the current locale's slot", () => {

        const form = createForm({ fields, locales: ["en", "ar"], locale: "ar", submit: async () => null });

        form.getState().load({ title: "عنوان" });
        expect(form.getState().values.title).toEqual({ en: "", ar: "عنوان" });

    });

});

describe("dotted fields", () => {

    const nested: FieldFact[] = [
        { name: "name", kind: "text", required: true, nullable: false },
        { name: "address.city", kind: "text", required: false, nullable: false },
        { name: "address.zip", kind: "text", required: false, nullable: false },
    ];

    test("values load from the nested record and submit builds it back", async () => {

        const sent: unknown[] = [];
        const form = createForm({
            fields: nested,
            locales: ["en"],
            submit: async ( values ) => {

                sent.push(values);

                return 1;

            },
        });

        form.getState().load({ name: "Walk", address: { city: "Cairo" } });
        expect(form.getState().values).toEqual({ name: "Walk", "address.city": "Cairo", "address.zip": "" });
        form.getState().set("address.zip", "11511");
        await form.getState().submit();
        expect(sent[0]).toEqual({ name: "Walk", address: { city: "Cairo", zip: "11511" } });

    });
    test("a failure keyed by the dotted path lands on that field", async () => {

        const form = createForm({
            fields: nested,
            locales: ["en"],
            submit: async () => {

                throw new Failure("input", { errors: { "address.city": ["too short"] } });

            },
        });

        await form.getState().submit();
        expect(Object.keys(form.getState().errors)).toEqual(["address.city"]);

    });

});
describe("autosave", () => {

    test("a dirty form submits itself once after the quiet delay and not when clean", async () => {

        const sent: unknown[] = [];
        const form = createForm({
            fields: [{ name: "name", kind: "text", required: true, nullable: false }],
            locales: ["en"],
            autosave: 30,
            submit: async ( values ) => {

                sent.push(values);

                return 1;

            },
        });

        form.getState().set("name", "W");
        form.getState().set("name", "Wa");
        form.getState().set("name", "Walk");
        expect(sent).toEqual([]);
        await Bun.sleep(60);
        expect(sent).toEqual([{ name: "Walk" }]);
        expect(form.getState().status).toBe("done");
        expect(form.getState().dirty).toBe(false);
        await Bun.sleep(40);
        expect(sent).toHaveLength(1);

    });

});
describe("form labels and texts", () => {

    test("a field's label is its own entry, then its dotted path, then its name", () => {

        const labels = { name: "Name", address: { city: "City" } };

        expect(fieldLabel(labels, "name")).toBe("Name");
        expect(fieldLabel(labels, "address.city")).toBe("City");
        expect(fieldLabel(labels, "address")).toBe("address");
        expect(fieldLabel(labels, "unknown")).toBe("unknown");

    });
    test("a text control shows only text values", () => {

        expect(formText("tea")).toBe("tea");
        expect(formText(true)).toBe("");
        expect(formText(null)).toBe("");

    });
    test("only a plain per-language map counts as localized texts", () => {

        expect(localizedTexts({ en: "Tea", ar: "شاي" })).toEqual({ en: "Tea", ar: "شاي" });
        expect(localizedTexts("tea")).toEqual({});
        expect(localizedTexts(["tea"])).toEqual({});
        expect(localizedTexts({ uri: "file:///a", name: "a", type: "image/png" })).toEqual({});
        expect(localizedTexts(new Blob(["x"]))).toEqual({});
        expect(localizedTexts(null)).toEqual({});

    });
    test("translation rows fold into the localized fields of a record, one text per language", () => {

        const fields: FieldFact[] = [
            { name: "name", kind: "localized", required: true, nullable: false },
            { name: "stock", kind: "integer", required: false, nullable: false },
        ];
        const record = { id: 1, name: "Tea", stock: 3 };
        const translations = [{ locale: "en", name: "Tea" }, { locale: "ar", name: "شاي" }, { locale: "fr" }, { name: "x" }];

        expect(withTranslations(record, translations, fields)).toEqual({ id: 1, name: { en: "Tea", ar: "شاي" }, stock: 3 });
        expect(withTranslations(record, [], fields)).toBe(record);
        expect(withTranslations(undefined, [{ locale: "en", name: "Tea" }], fields)).toEqual({ name: { en: "Tea" } });

    });

});
