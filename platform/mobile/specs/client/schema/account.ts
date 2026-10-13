import { block, feature, read, screen, t, write } from "../../../src/lib/spec/surface.ts";

const states = { loading: t("state.loading"), failed: t("state.failed"), offline: t("state.offline"), cached: t("state.cached") };

export default screen({
    contents: {
        name: "account",
        path: "/account",
        title: t("account.title"),
        description: t("account.description"),
        icon: "user",
    },
    options: { presentation: "tab", order: 1, tabs: true },
    access: "user",
    redirect: "/login",
    blocks: [
        block({ width: "boxed", padding: 4, gap: 4 }, [
            feature("form", {
                heading: true,
                options: { title: t("account.profile"), submit: t("account.save"), saved: t("account.saved"), ...states, empty: t("state.empty"), leave: t("form.leave"), queued: t("state.queued"), errors: t("errors"), labels: t("account.fields"), choices: t("account.choices") },
                ports: { item: read("account.me"), save: write("account.update") },
            }),
            feature("avatar", {
                options: { title: t("avatar.title"), pick: t("avatar.pick"), camera: t("avatar.camera"), saved: t("avatar.saved"), empty: t("avatar.empty"), ...states, errors: t("errors") },
                ports: { me: read("account.me"), save: write("account.avatar") },
            }),
            feature("location", {
                options: { title: t("location.title"), detail: t("location.detail"), locate: t("location.locate"), saved: t("location.saved"), queued: t("state.queued"), failed: t("state.failed"), denied: t("location.denied"), unsupported: t("location.unsupported"), errors: t("errors") },
                ports: { save: write("account.locate") },
            }),
            feature("notifications", {
                options: { title: t("notifications.title"), detail: t("notifications.detail"), enable: t("notifications.enable"), saved: t("notifications.saved"), queued: t("state.queued"), failed: t("state.failed"), denied: t("notifications.denied"), unsupported: t("notifications.unsupported"), errors: t("errors") },
                ports: { save: write("account.device") },
            }),
            feature("preferences", {
                options: {
                    title: t("preferences.title"), language: t("preferences.language"), currency: t("preferences.currency"), theme: t("preferences.theme"),
                    themes: { light: t("preferences.light"), dark: t("preferences.dark"), system: t("preferences.system") },
                    saved: t("preferences.saved"),
                },
            }),
        ]),
    ],
});
