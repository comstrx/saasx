import { block, feature, screen, t, write } from "../../../src/lib/spec/surface.ts";

const fields = ["type", "subtype", "name", "stock", "capacity", "featured", "starts_at", "ends_at"];

export default screen({
    contents: {
        name: "create",
        path: "/catalog/new",
        title: t("admin.newCatalog"),
        description: t("admin.newDescription"),
        icon: "plus",
    },
    access: "user",
    redirect: "/login",
    blocks: [
        block({ width: "narrow", padding: 6 }, [
            feature("form", {
                heading: true,
                options: {
                    title: t("admin.newCatalog"),
                    submit: t("admin.create"),
                    saved: t("admin.saved"),
                    leave: t("form.leave"),
                    queued: t("state.queued"),
                    next: "/catalog/{id}/edit",
                    labels: t("catalog.fields"),
                    choices: t("catalog.choices"),
                },
                ports: { save: write("manage.create", {}, fields) },
            }),
        ]),
    ],
});
