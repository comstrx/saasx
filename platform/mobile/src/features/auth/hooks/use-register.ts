import { leave, settle } from "@/features/auth/flow";
import { useAuthBack, useAuthCleanup, useAuthDraft } from "@/features/auth/hooks/use-auth-draft";
import { useDials } from "@/features/shell/hooks/use-dials";
import { acceptIdentity, registrationErrorStep, validateIdentity, validatePasswords, validateProfile } from "@/model/auth";
import { homeIso } from "@/model/country";
import { useAuthCheck, useRegister } from "@/query/auth";
import { usePasswordPolicy } from "@/query/contract";
import { dialOf, e164 } from "@/std/identity";

const owned = [ "name", "email", "phone", "promotion_code", "password", "password_confirmation" ] as const;
const secrets = { password: "", password_confirmation: "", hidden: true };
const initial = { ...secrets, step: 0, ahead: true, name: "", email: "", promotion_code: "", iso: homeIso, digits: "", checkedEmail: "", checkedPhone: "" };

export function useRegisterFlow () {

    const dials = useDials();
    const draft = useAuthDraft(initial, owned);
    const { form, patch, edit, run } = draft;
    const { mutateAsync: check, reset: clearCheck } = useAuthCheck();
    const { mutateAsync: register, reset: clearMutation } = useRegister();
    useAuthCleanup(() => { clearCheck(); clearMutation(); });
    const policy = usePasswordPolicy();
    const email = form.email.trim();
    const phone = e164(dialOf(dials, form.iso), form.digits);

    const go = ( step: number ) => edit({
        step, ahead: step > form.step, ...secrets,
        ...( step <= 1 ? { checkedEmail: "", checkedPhone: "" } : { checkedPhone: "" } ),
    });

    const back = () => { if ( form.step === 0 ) { draft.clear(); leave(); } else go(form.step - 1); };

    useAuthBack(back);

    const claim = async () => {

        if ( form.step !== 1 ) return;
        const outcome = await run("check-email", async ( attempt ) => {

            const identity = { kind: "email", value: email } as const;
            validateIdentity(identity);
            acceptIdentity(identity, await check({ identity, attempt }), "register");

        });

        if ( outcome.ok ) patch({ step: 2, ahead: true, checkedEmail: email });

    };

    const about = async () => {

        if ( form.step !== 2 ) return;
        if ( !form.checkedEmail || form.checkedEmail !== email ) { go(1); return; }
        const outcome = await run("check-phone", async ( attempt ) => {

            validateProfile(form.name, form.promotion_code);
            const identity = { kind: "phone", value: phone } as const;
            validateIdentity(identity);
            acceptIdentity(identity, await check({ identity, attempt }), "register");

        });

        if ( outcome.ok ) patch({ step: 3, ahead: true, checkedPhone: phone, ...secrets });

    };

    const submit = async () => {

        if ( form.step !== 3 ) return;
        if ( !form.checkedEmail || form.checkedEmail !== email ) { go(1); return; }
        if ( !form.checkedPhone || form.checkedPhone !== phone ) { go(2); return; }

        const outcome = await run("register", ( attempt ) => {

            validateProfile(form.name, form.promotion_code);
            validatePasswords(form.password, form.password_confirmation, policy);

            return register({ body: {
                name: form.name.trim(), email, phone,
                password: form.password, password_confirmation: form.password_confirmation,
                ...( form.promotion_code.trim() ? { promotion_code: form.promotion_code.trim() } : {} ),
            }, attempt });

        });

        if ( !outcome.ok ) {

            const step = registrationErrorStep(outcome.fields);
            if ( step !== null ) patch({
                step, ahead: false, ...secrets, checkedPhone: "",
                ...( step === 1 ? { checkedEmail: "" } : {} ),
            });
            return;

        }

        await settle(outcome.value, "register");

    };

    return { ...draft, dials, policy, back, go, claim, about, submit };

}
