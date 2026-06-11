import { describe, expect, it } from "vitest";
import { z } from "zod";
import { resource } from "./resource";

describe("resource", () => {

    it("generates the five conventional entries", () => {

        const users = resource("users");

        expect(users.list).toMatchObject({ resource: "users", action: "list", method: "GET", path: "/users", need: "users.view" });
        expect(users.show).toMatchObject({ resource: "users", action: "show", method: "GET", path: "/users/:id", need: "users.view" });
        expect(users.create).toMatchObject({ resource: "users", action: "create", method: "POST", path: "/users", need: "users.create" });
        expect(users.update).toMatchObject({ resource: "users", action: "update", method: "PATCH", path: "/users/:id", need: "users.update" });
        expect(users.destroy).toMatchObject({ resource: "users", action: "destroy", method: "DELETE", path: "/users/:id", need: "users.delete" });

    });

    it("merges extras as explicit entries on the resource", () => {

        const users = resource("users", {
            extra: {
                image: { path: "/users/:id/image", method: "POST", need: "users.update" },
            },
        });

        expect(users.image).toEqual({
            resource: "users",
            action: "image",
            method: "POST",
            path: "/users/:id/image",
            need: "users.update",
        });

    });

    it("attaches the schema to show and an array of it to list", () => {

        const item = z.object({ id: z.string() });
        const products = resource("products", { schema: item });

        expect(products.show.schema).toBe(item);
        expect(products.list.schema?.safeParse([{ id: "1" }]).success).toBe(true);
        expect(products.list.schema?.safeParse({ id: "1" }).success).toBe(false);
        expect(products.create.schema).toBeUndefined();
        expect(products.update.schema).toBeUndefined();
        expect(products.destroy.schema).toBeUndefined();

    });

});
