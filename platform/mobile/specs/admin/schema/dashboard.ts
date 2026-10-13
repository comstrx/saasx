import { block, feature, live, read, screen, signal, t, write } from "../../../src/lib/spec/surface.ts";

const states = { loading: t("state.loading"), failed: t("state.failed"), offline: t("state.offline"), cached: t("state.cached") };

export default screen({
    contents: {
        name: "dashboard",
        path: "/",
        title: t("admin.dashboard"),
        description: t("admin.description"),
        icon: "grid",
    },
    options: { presentation: "tab", order: 0, tabs: true },
    access: "user",
    redirect: "/login",
    blocks: [
        block({ width: "full", padding: 4, gap: 4 }, [
            feature("search", { options: { placeholder: t("search.placeholder"), go: t("search.go"), mode: "signal" } }),
            feature("account", {
                options: { hello: t("account.hello"), logout: t("account.logout"), ...states },
                ports: { me: read("manage.me"), leave: write("manage.logout") },
            }),
            feature("table", {
                heading: true,
                options: {
                    title: t("admin.catalogs"), empty: t("catalogue.empty"), ...states, select: true, paging: true,
                    columns: [
                        { key: "id", label: t("table.id"), kind: "number" },
                        { key: "name", label: t("table.name") },
                        { key: "type", label: t("table.type"), kind: "badge" },
                        { key: "stock", label: t("table.stock"), kind: "number" },
                        { key: "sale_price", label: t("table.price"), kind: "money" },
                    ],
                    sorts: [
                        { value: "newest", label: t("table.sorts.newest") },
                        { value: "oldest", label: t("table.sorts.oldest") },
                        { value: "highest_price", label: t("table.sorts.highest_price") },
                    ],
                    labels: { sort: t("table.sort"), page: t("table.page"), previous: t("table.previous"), next: t("table.next") },
                },
                ports: {
                    rows: read("manage.list", { limit: 10, search: signal("search"), sort: signal("sort"), page: signal("page") }, live("announcements.1", ["announcement.event"], { path: "catalog", version: "updated_at" })),
                },
            }),
            feature("detail", {
                options: {
                    from: t("catalogue.from"), missing: t("state.missing"), back: "", pick: t("preview.pick"), ...states,
                    edit: "/catalog/{id}/edit", editLabel: t("admin.edit"), remove: t("admin.remove"), restore: t("admin.restore"), removed: t("admin.removed"), restored: t("admin.restored"),
                    labels: t("catalog.fields"),
                },
                ports: { item: read("manage.view", { id: signal("selected", { wait: true }) }), remove: write("manage.remove", { id: signal("selected") }), restore: write("manage.restore", { id: signal("selected") }) },
            }),
        ]),
    ],
});
