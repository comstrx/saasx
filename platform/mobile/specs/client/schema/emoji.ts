import { block, feature, screen, t } from "../../../src/lib/spec/surface.ts";

export default screen({
    contents: {
        name: "emoji",
        path: "/emoji",
        title: t("emoji.title"),
        description: t("emoji.description"),
        icon: "smile",
    },
    options: { presentation: "tab", order: 1, tabs: true, scroll: false },
    blocks: [
        block({ width: "full", height: "screen", padding: 4 }, [
            feature("emoji", {
                heading: true,
                options: { title: t("emoji.title"), placeholder: t("emoji.placeholder"), empty: t("emoji.empty"), tone: t("emoji.tone") },
            }),
        ]),
    ],
});
