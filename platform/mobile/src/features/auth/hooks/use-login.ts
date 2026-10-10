import { leave, settle } from "@/features/auth/flow";
import { useAuthBack, useAuthCleanup, useAuthDraft } from "@/features/auth/hooks/use-auth-draft";
import { useDials } from "@/features/shell/hooks/use-dials";
import { acceptIdentity, validateIdentity } from "@/model/auth";
import { homeIso } from "@/model/country";
import { useAuthCheck, useLogin } from "@/query/auth";
import { dialOf, e164, type Identified, type IdentityKind } from "@/std/identity";

const owned = [ "email", "phone", "password" ] as const;
const alias = { account: "password", credentials: "password" };
const initial = { step: 0, ahead: true, kind: "email" as IdentityKind, email: "", iso: homeIso, digits: "", password: "", hidden: true, checked: "" };

export function useLoginFlow () {

    const dials = useDials();
    const draft = useAuthDraft(initial, owned, alias);
    const { form, patch, edit, run } = draft;
    const { mutateAsync: check, reset: clearCheck } = useAuthCheck();
    const { mutateAsync: login, reset: clearMutation } = useLogin();
    useAuthCleanup(() => { clearCheck(); clearMutation(); });
    const byMail = form.kind === "email";
    const identified: Identified = byMail
        ? { kind: "email", value: form.email.trim() }
        : { kind: "phone", value: e164(dialOf(dials, form.iso), form.digits) };

    const back = () => {

        if ( form.step === 0 ) { draft.clear(); leave(); return; }
        edit({ step: form.step - 1, ahead: false, password: "", hidden: true, checked: "" });

    };

    useAuthBack(back);

    const pick = ( kind: IdentityKind ) => edit({ ...initial, kind, step: 1 });
    const forward = async () => {

        if ( form.step !== 1 ) return;
        const outcome = await run("check", async ( attempt ) => {

            validateIdentity(identified);
            acceptIdentity(identified, await check({ identity: identified, attempt }), "login");

        });

        if ( outcome.ok ) patch({ step: 2, ahead: true, checked: identified.value, password: "", hidden: true });

    };

    const submit = async () => {

        if ( form.step !== 2 || !form.password ) return;
        if ( !form.checked || form.checked !== identified.value ) { edit({ step: 1, password: "", hidden: true }); return; }

        const outcome = await run("login", ( attempt ) => login({ identity: identified, password: form.password, attempt }) );

        if ( !outcome.ok ) {

            if ( outcome.fields.email || outcome.fields.phone ) patch({ step: 1, ahead: false, password: "", hidden: true, checked: "" });
            return;

        }

        await settle(outcome.value, "login");

    };

    return { ...draft, dials, byMail, back, pick, forward, submit, reached: byMail ? Boolean(form.email.trim()) : form.digits.length > 4 };

}
