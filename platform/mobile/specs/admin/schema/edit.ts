import { block, feature, param, read, screen, t, write } from "../../../src/lib/spec/surface.ts";

export default screen({
    contents: {
        name: "edit",
        path: "/catalog/:id/edit",
        title: t("admin.editCatalog"),
        description: t("admin.editDescription"),
        icon: "pencil",
    },
    options: { tabs: true },
    access: "user",
    redirect: "/login",
    blocks: [
        block({ width: "full", padding: 4 }, [
            feature("form", {
                heading: true,
                options: {
                    title: t("admin.editCatalog"), submit: t("admin.save"), saved: t("admin.saved"), failed: t("state.failed"),
                    loading: t("state.loading"), offline: t("state.offline"), cached: t("state.cached"), empty: t("state.empty"), leave: t("form.leave"), queued: t("state.queued"), errors: t("errors"),
                    labels: t("catalog.fields"), choices: t("catalog.choices"),
                },
                ports: {
                    item: read("manage.view", { id: param("id") }),
                    texts: read("manage.texts", { id: param("id") }),
                    save: write("manage.update", { id: param("id") }, ["type", "subtype", "name", "stock", "capacity", "featured", "starts_at", "ends_at"]),
                },
            }),
        ]),
    ],
});
