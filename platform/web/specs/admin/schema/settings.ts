import { block, feature, screen, t } from "../../../src/lib/spec/surface.ts";

export default screen({
    contents: {
        name: "settings",
        path: "/settings",
        title: t("admin.settings"),
        description: t("admin.settingsDescription"),
        icon: "sliders",
    },
    access: "user",
    redirect: "/login",
    blocks: [
        block({ width: "narrow", padding: 6 }, [
            feature("preferences", {
                heading: true,
                options: {
                    title: t("preferences.title"),
                    language: t("preferences.language"),
                    currency: t("preferences.currency"),
                    theme: t("preferences.theme"),
                    themes: { light: t("preferences.light"), dark: t("preferences.dark"), system: t("preferences.system") },
                    saved: t("preferences.saved"), failed: t("state.failed"),
                },
            }),
        ]),
    ],
});
