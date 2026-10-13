import { block, feature, param, read, screen, t } from "../../../src/lib/spec/surface.ts";

export default screen({
    contents: {
        name: "catalog",
        path: "/catalog/:id",
        title: t("catalog.title"),
        description: t("catalog.description"),
        icon: "tag",
        entity: "catalog",
    },
    blocks: [
        block({ width: "wide", padding: 6 }, [
            feature("detail", {
                heading: true,
                options: { from: t("catalogue.from"), missing: t("state.missing"), back: t("catalog.back") },
                ports: { item: read("catalogs.view", { id: param("id") }) },
            }),
        ]),
    ],
});
