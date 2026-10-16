import { block, feature, live, read, screen, signal, t, write } from "../../../src/lib/spec/surface.ts";

export default screen({
    contents: {
        name: "dashboard",
        path: "/",
        title: t("admin.dashboard"),
        description: t("admin.description"),
        icon: "grid",
    },
    access: "user",
    redirect: "/login",
    blocks: [
        block({ width: "wide", padding: 6, gap: 6 }, [
            feature("search", { options: { placeholder: t("search.placeholder"), go: t("search.go"), mode: "signal" } }),
            feature("account", {
                options: { hello: t("account.hello"), logout: t("account.logout") },
                ports: { me: read("manage.me"), leave: write("manage.logout") },
            }),
        ]),
        block({ width: "wide", padding: 6, gap: 6, sizes: [2, 1] }, [
            feature("table", {
                heading: true,
                options: {
                    title: t("admin.catalogs"),
                    empty: t("catalogue.empty"),
                    select: true,
                    paging: true,
                    columns: [
                        { key: "id", label: t("table.id"), kind: "number" },
                        { key: "name", label: t("table.name") },
                        { key: "type", label: t("table.type"), kind: "badge" },
                        { key: "stock", label: t("table.stock"), kind: "number" },
                        { key: "featured", label: t("table.featured"), kind: "boolean" },
                        { key: "sale_price", label: t("table.price"), kind: "money" },
                        { key: "created_at", label: t("table.created"), kind: "date" },
                    ],
                    sorts: [
                        { value: "newest", label: t("table.sorts.newest") },
                        { value: "oldest", label: t("table.sorts.oldest") },
                        { value: "lowest_price", label: t("table.sorts.lowest_price") },
                        { value: "highest_price", label: t("table.sorts.highest_price") },
                        { value: "highest_rated", label: t("table.sorts.highest_rated") },
                    ],
                    labels: { sort: t("table.sort"), page: t("table.page"), previous: t("table.previous"), next: t("table.next") },
                },
                ports: {
                    rows: read(
                        "manage.list",
                        { limit: 10, search: signal("search"), sort: signal("sort"), page: signal("page") },
                        live("announcements.1", ["announcement.event"], { path: "catalog", version: "updated_at" }),
                    ),
                },
            }),
            feature("preview", {
                options: {
                    title: t("preview.title"),
                    pick: t("preview.pick"),
                    from: t("catalogue.from"),
                    missing: t("state.missing"),
                    edit: "/catalog/:id/edit",
                    editLabel: t("admin.edit"),
                    remove: t("admin.remove"),
                    restore: t("admin.restore"),
                    removed: t("admin.removed"),
                    restored: t("admin.restored"),
                    denied: t("admin.denied"),
                    labels: t("catalog.fields"),
                },
                ports: {
                    item: read("manage.view", { id: signal("selected", { wait: true }) }),
                    remove: write("manage.remove", { id: signal("selected") }),
                    restore: write("manage.restore", { id: signal("selected") }),
                },
            }),
        ]),
    ],
});
