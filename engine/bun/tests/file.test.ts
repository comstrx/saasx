import { describe, expect, test } from "bun:test";
import { Failure } from "engine/error";
import { checkFile, dataUri, extensionOf, isFileRef, mimeOf, toFormData } from "engine/file";

describe("file", () => {

    test("mime types follow the extension", () => {

        expect(mimeOf("photo.WEBP")).toBe("image/webp");
        expect(mimeOf("unknown.bin")).toBe("application/octet-stream");

    });
    test("form data flattens arrays and objects and checks files against the limits", () => {

        const file = new Blob(["abc"], { type: "image/png" });
        const data = toFormData({ title: "t", tags: ["a", "b"], meta: { x: 1 }, file }, { maxBytes: 10, maxFiles: 1 });

        expect(data.getAll("tags[]")).toEqual(["a", "b"]);
        expect(data.get("meta")).toBe('{"x":1}');
        expect(data.get("file")).toBeInstanceOf(Blob);
        expect(() => checkFile(file, { maxBytes: 2, maxFiles: 1 })).toThrow(Failure);
        expect(() => checkFile(file, { maxBytes: 10, maxFiles: 1, types: ["video/*"] })).toThrow(Failure);

    });

});
describe("file references", () => {

    test("a native file reference is appended as a part, not serialized", () => {

        const data = toFormData({ image: { uri: "file:///a.png", name: "a.png", type: "image/png" }, note: { a: 1 } });

        expect(typeof data.get("note")).toBe("string");
        expect(data.get("note")).toBe(JSON.stringify({ a: 1 }));
        expect(data.get("image")).not.toBe(JSON.stringify({ uri: "file:///a.png", name: "a.png", type: "image/png" }));
        expect(isFileRef({ uri: "file:///a.png", name: "a.png", type: "image/png" })).toBe(true);
        expect(isFileRef({ uri: "x" })).toBe(false);

    });

});
describe("edges", () => {

    test("extensions ignore case, a missing or trailing dot gives none, unknown types are octet streams", () => {

        expect(extensionOf("Photo.JPG")).toBe("jpg");
        expect(extensionOf("README")).toBe("");
        expect(extensionOf("odd.")).toBe("");
        expect(mimeOf("archive.zip")).toBe("application/octet-stream");
        expect(mimeOf("x.webp")).toBe("image/webp");

    });
    test("type limits accept a wildcard family or an exact type and refuse the rest by reason", () => {

        const png = new Blob(["x"], { type: "image/png" });
        const pdf = new Blob(["x"], { type: "application/pdf" });

        expect(() => checkFile(png, { maxBytes: 10, maxFiles: 1, types: ["image/*"] })).not.toThrow();
        expect(() => checkFile(pdf, { maxBytes: 10, maxFiles: 1, types: ["image/*", "text/csv"] })).toThrow(Failure);
        expect(() => checkFile(pdf, { maxBytes: 10, maxFiles: 1, types: ["application/pdf"] })).not.toThrow();

        try {

            checkFile(new Blob(["abcdef"]), { maxBytes: 3, maxFiles: 1 }, "image");

        } catch ( error ) {

            expect((error as Failure).reason).toBe("file_too_large");
            expect(Object.keys((error as Failure).errors)).toEqual(["image"]);

        }

    });
    test("form data skips null and undefined, counts files across arrays, and stops past the limit", () => {

        const blob = new Blob(["x"], { type: "image/png" });
        const data = toFormData({ a: null, b: undefined, files: [blob, blob], note: { k: 1 }, on: true }, { maxBytes: 10, maxFiles: 2 });

        expect(data.has("a")).toBe(false);
        expect(data.getAll("files[]")).toHaveLength(2);
        expect(data.get("note")).toBe('{"k":1}');
        expect(data.get("on")).toBe("true");
        expect(() => toFormData({ files: [blob, blob, blob] }, { maxBytes: 10, maxFiles: 2 })).toThrow(Failure);
        expect(dataUri("image/png", "AAA=")).toBe("data:image/png;base64,AAA=");

    });

});
