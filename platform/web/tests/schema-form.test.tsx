import { describe, expect, test } from "bun:test";
import { createForm } from "engine/client";
import type { FieldFact } from "engine/validate";
import { renderToString } from "react-dom/server";
import SchemaForm from "../src/components/schema-form";

const fields: FieldFact[] = [
    { name: "type", kind: "choice", required: true, nullable: false, choices: ["hotel", "room"] },
    { name: "subtype", kind: "choice", required: false, nullable: false, choices: ["a", "b"] },
    { name: "name", kind: "localized", required: true, nullable: false },
    { name: "stock", kind: "integer", required: false, nullable: false, min: 0 },
    { name: "featured", kind: "boolean", required: false, nullable: false },
    { name: "starts_at", kind: "date", required: false, nullable: false },
    { name: "tags", kind: "list", required: false, nullable: false },
    { name: "image", kind: "file", required: false, nullable: false },
];

function render ( errors: Record<string, string> = {} ) {

    const store = createForm({ fields, locales: ["en", "ar"], submit: async () => null });

    const labels = { type: "Type", name: "Name", stock: "Stock", featured: "Featured", starts_at: "Starts", tags: "Tags", image: "Image" };
    const choices = { type: { hotel: "Hotel", room: "Room" } };

    return renderToString(<SchemaForm name="t" form={{ ...store.getState(), errors }} labels={labels} choices={choices} submit="Save" />);

}
describe("schema form", () => {

    test("draws one control per field kind from the facts alone", () => {

        const html = render();

        expect(html).toContain('name="type"');
        expect(html).toContain(">Hotel<");
        expect(html).toContain('name="subtype"');
        expect(html).toContain(">—<");
        expect(html).toContain('name="name[en]"');
        expect(html).toContain('name="name[ar]"');
        expect(html).toContain('type="number"');
        expect(html).toContain('type="checkbox"');
        expect(html).toContain('type="date"');
        expect(html).toContain('type="file"');
        expect(html).toContain('name="tags"');
        expect(html).toContain(">Save<");

    });
    test("field errors land beside their field and form errors below the fields", () => {

        const html = render({ stock: "Too low", _form: "Nope" });

        expect(html).toContain('role="alert"');
        expect(html).toContain("Too low");
        expect(html).toContain("Nope");

    });

});
