import { block, feature, screen, t, write } from "../../../src/lib/spec/surface.ts";

export default screen({
    contents: {
        name: "login",
        path: "/login",
        title: t("login.title"),
        description: t("login.description"),
        icon: "key",
    },
    access: "guest",
    redirect: "/",
    blocks: [
        block({ width: "narrow", padding: 4 }, [
            feature("login", {
                heading: true,
                options: {
                    title: t("login.title"), email: t("login.email"), password: t("login.password"), continue: t("login.continue"),
                    otp: t("login.otp"), verify: t("login.verify"), sent: t("login.sent"), back: t("login.back"), failed: t("state.failed"), errors: t("errors"),
                },
                ports: { login: write("staff.login"), verify: write("staff.verify") },
            }),
        ]),
    ],
});
