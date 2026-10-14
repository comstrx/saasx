import { block, feature, screen, t } from "../../../src/lib/spec/surface.ts";

export default screen({
    contents: {
        name: "emoji",
        path: "/emoji",
        title: t("emoji.title"),
        description: t("emoji.description"),
        icon: "smile",
    },
    blocks: [
        block({ width: "wide", padding: 6 }, [
            feature("emoji", {
                heading: true,
                options: { title: t("emoji.title"), placeholder: t("emoji.placeholder"), empty: t("emoji.empty") },
            }),
        ]),
    ],
});
