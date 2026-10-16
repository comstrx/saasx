import { block, feature, screen, t } from "../../../src/lib/spec/surface.ts";

export default screen({
    contents: {
        name: "settings",
        path: "/settings",
        title: t("admin.settings"),
        description: t("admin.settingsDescription"),
        icon: "sliders",
    },
    options: { presentation: "tab", order: 2, tabs: true },
    access: "user",
    redirect: "/login",
    blocks: [
        block({ width: "full", padding: 4 }, [
            feature("preferences", {
                heading: true,
                options: {
                    title: t("preferences.title"),
                    language: t("preferences.language"),
                    currency: t("preferences.currency"),
                    theme: t("preferences.theme"),
                    themes: { light: t("preferences.light"), dark: t("preferences.dark"), system: t("preferences.system") },
                    saved: t("preferences.saved"),
                },
            }),
        ]),
    ],
});
