import { block, feature, param, read, screen, t, write } from "../../../src/lib/spec/surface.ts";

const fields = ["type", "subtype", "name", "stock", "capacity", "featured", "starts_at", "ends_at"];

export default screen({
    contents: {
        name: "edit",
        path: "/catalog/:id/edit",
        title: t("admin.editCatalog"),
        description: t("admin.editDescription"),
        icon: "pencil",
    },
    access: "user",
    redirect: "/login",
    blocks: [
        block({ width: "narrow", padding: 6 }, [
            feature("form", {
                heading: true,
                options: {
                    title: t("admin.editCatalog"),
                    submit: t("admin.save"),
                    saved: t("admin.saved"),
                    leave: t("form.leave"),
                    queued: t("state.queued"),
                    labels: t("catalog.fields"),
                    choices: t("catalog.choices"),
                },
                ports: {
                    item: read("manage.view", { id: param("id") }),
                    texts: read("manage.texts", { id: param("id") }),
                    save: write("manage.update", { id: param("id") }, fields),
                },
            }),
        ]),
    ],
});
