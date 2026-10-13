import { block, feature, read, screen, signal, t, write } from "../../../src/lib/spec/surface.ts";

export default screen({
    contents: {
        name: "home",
        path: "/",
        title: t("nav.home"),
        description: t("home.description"),
        icon: "house",
    },
    options: { presentation: "tab", order: 0, tabs: true },
    blocks: [
        block({ width: "boxed", padding: 4, gap: 4 }, [
            feature("search", { options: { placeholder: t("search.placeholder"), go: t("search.go"), mode: "signal" } }),
            feature("account", {
                options: { hello: t("account.hello"), logout: t("account.logout"), loading: t("account.loading"), failed: t("state.failed"), offline: t("account.offline"), cached: t("account.cached"), errors: t("errors") },
                ports: { me: read("account.me"), leave: write("account.logout") },
            }),
            feature("catalogue", {
                heading: true,
                options: { title: t("catalogue.title"), empty: t("catalogue.empty"), from: t("catalogue.from"), columns: 2, loading: t("state.loading"), failed: t("state.failed"), offline: t("state.offline"), cached: t("state.cached") },
                ports: { items: read("catalogs.list", { limit: 12, search: signal("search") }) },
            }),
        ]),
    ],
});
