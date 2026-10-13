import { block, feature, screen, t, write } from "../../../src/lib/spec/surface.ts";

export default screen({
    contents: {
        name: "create",
        path: "/catalog/new",
        title: t("admin.newCatalog"),
        description: t("admin.newDescription"),
        icon: "plus",
    },
    options: { presentation: "tab", order: 1, tabs: true },
    access: "user",
    redirect: "/login",
    blocks: [
        block({ width: "full", padding: 4 }, [
            feature("form", {
                heading: true,
                options: {
                    title: t("admin.newCatalog"), submit: t("admin.create"), saved: t("admin.saved"), failed: t("state.failed"),
                    loading: t("state.loading"), offline: t("state.offline"), cached: t("state.cached"), empty: t("state.empty"), queued: t("state.queued"), errors: t("errors"),
                    next: "/catalog/{id}/edit", labels: t("catalog.fields"), choices: t("catalog.choices"),
                },
                ports: { save: write("manage.create", {}, ["type", "subtype", "name", "stock", "capacity", "featured", "starts_at", "ends_at"]) },
            }),
        ]),
    ],
});
