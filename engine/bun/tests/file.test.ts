import { describe, expect, test } from "bun:test";
import { Failure } from "@engine/error";
import { checkFile, isFileRef, mimeOf, toFormData } from "@engine/file";

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
