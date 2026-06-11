import { describe, expect, it, vi } from "vitest";
import { createCollection } from "./create-collection";

type Item = { id: string; label: string };

const seed = ( name: string ) => {

    const items = createCollection<Item>(name);

    items.add({ id: "a", label: "alpha" });
    items.add({ id: "b", label: "beta" });

    return items;

};

describe("createCollection", () => {

    it("adds and reads items", () => {

        const items = seed("read");

        expect(items.all()).toHaveLength(2);
        expect(items.get("a")).toEqual({ id: "a", label: "alpha" });
        expect(items.get("missing")).toBeUndefined();
        expect(items.has("b")).toBe(true);
        expect(items.has("missing")).toBe(false);
        expect(items.find((item) => item.label === "beta")?.id).toBe("b");

    });

    it("upserts on duplicate id instead of duplicating", () => {

        const items = seed("upsert");

        items.add({ id: "a", label: "replaced" });

        expect(items.all()).toHaveLength(2);
        expect(items.get("a")?.label).toBe("replaced");

    });

    it("adds many with per-item upsert", () => {

        const items = seed("many");

        items.addMany([
            { id: "b", label: "updated" },
            { id: "c", label: "gamma" },
        ]);

        expect(items.all()).toHaveLength(3);
        expect(items.get("b")?.label).toBe("updated");
        expect(items.get("c")?.label).toBe("gamma");

    });

    it("patches an existing item and ignores unknown ids", () => {

        const items = seed("patch");

        items.update("a", { label: "patched" });
        items.update("missing", { label: "ghost" });

        expect(items.get("a")).toEqual({ id: "a", label: "patched" });
        expect(items.all()).toHaveLength(2);
        expect(items.has("missing")).toBe(false);

    });

    it("removes and clears", () => {

        const items = seed("remove");

        items.remove("a");

        expect(items.has("a")).toBe(false);
        expect(items.all()).toHaveLength(1);

        items.clear();

        expect(items.all()).toEqual([]);

    });

    it("notifies onChange only when the selected slice changes", () => {

        const items = seed("subscribe");
        const onCount = vi.fn();
        const unsubscribe = items.onChange((all) => all.length, onCount);

        items.update("a", { label: "renamed" });

        expect(onCount).not.toHaveBeenCalled();

        items.add({ id: "c", label: "gamma" });

        expect(onCount).toHaveBeenCalledTimes(1);
        expect(onCount).toHaveBeenCalledWith(3, 2);

        unsubscribe();
        items.add({ id: "d", label: "delta" });

        expect(onCount).toHaveBeenCalledTimes(1);

    });

});
