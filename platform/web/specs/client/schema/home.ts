import { block, feature, query, read, screen, t, write } from "../../../src/lib/spec/surface.ts";

export default screen({
    contents: {
        name: "home",
        path: "/",
        title: t("nav.home"),
        description: t("home.description"),
        icon: "house",
    },
    blocks: [
        block({ width: "wide", padding: 6, gap: 6 }, [
            feature("search", { options: { placeholder: t("search.placeholder"), go: t("search.go"), mode: "query" } }),
            feature("account", {
                options: {
                    hello: t("account.hello"),
                    logout: t("account.logout"),
                    loading: t("account.loading"),
                    offline: t("account.offline"),
                    cached: t("account.cached"),
                },
                ports: { me: read("account.me"), leave: write("account.logout") },
            }),
            feature("catalogue", {
                heading: true,
                options: { title: t("catalogue.title"), empty: t("catalogue.empty"), from: t("catalogue.from"), columns: 3 },
                ports: { items: read("catalogs.list", { limit: 12, search: query("search") }) },
            }),
        ]),
    ],
});
