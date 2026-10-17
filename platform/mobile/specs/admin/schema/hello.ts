import { block, feature, screen, t } from "../../../src/lib/spec/surface.ts";

export default screen({
    contents: {
        name: "hello",
        path: "/",
        title: t("hello.title"),
        description: t("hello.description"),
    },
    blocks: [
        block({ width: "narrow", padding: 4 }, [
            feature("hello", { heading: true, options: { text: t("hello.world") } }),
        ]),
    ],
});
