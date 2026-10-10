"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Data } from "@/api/features";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction, useRead } from "@/hooks/use-operation";
import { usePaymentChoices } from "@/hooks/use-payment-choices";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { type Challenge, challengeOf } from "@/lib/std/auth";
import { amountOf, money } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";

type Duration = "monthly" | "yearly" | "lifetime";
type Step = "plan" | "details" | "payment" | "verify";
type Plan = Data<"plans", "list">;
type Links = { workspaces: string; plans: string; login: string };
type Payment = { data?: { pay_url?: string | null; pay_data?: { pay_url?: string | null } | null } | null } | null | undefined;

const durations: readonly Duration[] = ["monthly", "yearly", "lifetime"];
const keys = { monthly: "monthly", yearly: "yearly", lifetime: "lifetime" } as const;
const blank = {
    name: "", email: "", phone: "", domain: "", password: "", confirm: "",
    adminName: "", adminEmail: "", adminPassword: "", adminConfirm: "",
};
const mail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function payUrl ( payment: Payment ): string | null {

    return payment?.data?.pay_url || payment?.data?.pay_data?.pay_url || null;

}
function priceOf ( plan: Plan | undefined, duration: Duration ) {

    if ( !plan ) return null;
    if ( plan.free ) return { now: 0, was: null, currency: plan.currency ?? "USD" };
    if ( !plan[`${keys[duration]}_price_id`] ) return null;

    const now = amountOf(plan[`${keys[duration]}_new_price`]);
    const was = amountOf(plan[`${keys[duration]}_old_price`]);

    return now ? { now: now.amount, was: was && was.amount > now.amount ? was.amount : null, currency: now.currency } : null;

}
export function useOnboarding ( links: Links ) {

    const t = useTranslations("onboarding");
    const locale = useLocale();
    const router = useRouter();
    const query = useSearchParams();
    const pathname = usePathname();
    const toast = useToast();
    const ready = useUi(( state ) => state.ready);
    const signed = useUi(( state ) => Boolean(state.token && state.user));
    const join = useUi(( state ) => state.join);
    const plans = useRead("plans", "list", { limit: 12 });
    const check = useAction("plans", "coupon");
    const preview = useAction("subscriptions", "preview");
    const create = useAction("tenants", "create");
    const landing = useAction("tenants", "landing");
    const [step, setStep] = useState<Step>("plan");
    const [planId, setPlanId] = useState<number | null>(() => Number(query.get("plan")) || null);
    const [duration, setDuration] = useState<Duration>(() => durations.find(( entry ) => entry === query.get("duration")) ?? "yearly");
    const [code, setCode] = useState("");
    const [applied, setApplied] = useState<string | null>(null);
    const [values, setValues] = useState(blank);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [method, setMethod] = useState("");
    const [currency, setCurrency] = useState("");
    const [challenge, setChallenge] = useState<{ value: Challenge; next: string | null } | null>(null);
    const gateways = useRead("gateways", "list", {}, { enabled: step === "payment" });
    const choices = usePaymentChoices(gateways.data ?? [], method);
    const options = useMemo(() => (
        signed ? choices.options : choices.options.filter(( option ) => option.value !== "wallet")
    ), [choices.options, signed]);
    const rows = useMemo(() => [...(plans.data ?? [])].sort(( a, b ) => (a.rank ?? 0) - (b.rank ?? 0)), [plans.data]);
    const plan = rows.find(( row ) => row.id === planId);
    const price = priceOf(plan, duration);
    const priced = price !== null;
    const action = signed ? create : landing;
    const failure = useAuthError(action.error ?? check.error);
    const quote = preview.result?.resource;
    const discount = check.result?.resource;
    const due = quote ? amountOf(quote.due_price ?? quote.price)?.amount ?? null
        : discount ? amountOf(discount.total_price)?.amount ?? null : null;
    const total = due ?? price?.now ?? null;
    const free = Boolean(plan?.free) || total === 0;
    const label = ( amount: number | null | undefined ) => {

        const found = amount == null ? null : money({ amount, currency: price?.currency ?? "USD" }, locale);

        return found ? { ...found, currencyLabel: found.currency } : null;

    };

    useEffect(() => {

        if ( !planId && rows.length ) setPlanId(rows.find(( row ) => row.recommended)?.id ?? rows[0]?.id ?? null);

    }, [planId, rows]);
    useEffect(() => {

        if ( !signed || !planId || !priced ) return;

        void preview.run({ plan_id: planId, duration, ...(applied ? { coupon_code: applied } : {}) }).catch(() => undefined);

    }, [signed, planId, duration, applied, priced, preview.run]);
    useEffect(() => {

        if ( !method && options[0] ) setMethod(options[0].value);

    }, [method, options]);

    function change ( patch: Partial<typeof blank> ) {

        setValues(( current ) => ({ ...current, ...patch }));
        setErrors(( current ) => Object.fromEntries(Object.entries(current).filter(( [key] ) => !(key in patch))));

    }
    async function apply () {

        const value = code.trim();

        if ( !planId || !value || check.pending ) return;

        const result = await check.run({ planId, code: value });

        setApplied(result ? value : null);

        if ( result ) toast({ title: t("couponApplied"), tone: "success" });

    }
    function validate (): boolean {

        const found: Record<string, string> = {};

        if ( values.name.trim().length < 2 ) found.name = t("nameRequired");

        if ( signed ) {

            if ( !mail.test(values.adminEmail.trim()) ) found.adminEmail = t("emailInvalid");
            if ( values.adminPassword.length < 8 ) found.adminPassword = t("passwordShort");
            if ( values.adminConfirm !== values.adminPassword ) found.adminConfirm = t("passwordMismatch");

        }
        else {

            if ( !mail.test(values.email.trim()) ) found.email = t("emailInvalid");
            if ( values.password.length < 8 ) found.password = t("passwordShort");
            if ( values.confirm !== values.password ) found.confirm = t("passwordMismatch");

        }

        setErrors(found);

        return !Object.keys(found).length;

    }
    function next () {

        if ( step === "plan" && plan && price ) setStep("details");
        else if ( step === "details" && validate() ) {

            if ( free ) void submit();
            else setStep("payment");

        }

    }
    function back () {

        setStep(step === "payment" ? "details" : "plan");

    }
    function finish ( target: string | null ) {

        if ( target && /^https?:\/\//.test(target) ) {

            window.location.assign(target);
            return;

        }

        toast({ title: t("createdTitle"), description: t("createdBody"), tone: "success" });
        router.replace(localePath(locale, links.workspaces, routing) as Route);

    }
    async function submit () {

        if ( !planId || action.pending ) return;

        const done = new URL(localePath(locale, links.workspaces, routing), window.location.origin).href;
        const shared = {
            name: values.name.trim(), plan_id: planId, duration,
            ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
            ...(values.domain.trim() ? { domain_name: values.domain.trim() } : {}),
            ...(applied ? { coupon_code: applied } : {}),
            ...(!free && method.startsWith("gateway:") ? {
                gateway_id: Number(method.slice(8)), ...(currency ? { payment_currency: currency } : {}),
            } : {}),
            redirect_url: done, failed_url: window.location.href,
        };

        if ( signed ) {

            const result = await create.run({
                ...shared,
                ...(values.email.trim() ? { email: values.email.trim() } : {}),
                ...(values.adminName.trim() ? { admin_name: values.adminName.trim() } : {}),
                admin_email: values.adminEmail.trim(),
                admin_password: values.adminPassword,
                admin_password_confirmation: values.adminConfirm,
            });

            if ( result ) finish(payUrl(result.resource.payment));

            return;

        }

        const result = await landing.run({
            ...shared, email: values.email.trim(), password: values.password, password_confirmation: values.confirm,
        });

        if ( !result ) return;

        const account = result.resource.data;
        const target = payUrl(result.resource.payment);
        const pending = challengeOf(account);

        if ( account.token && account.user ) join(account.token, account.user, "register");
        else if ( pending ) {

            setChallenge({ value: pending, next: target });
            setStep("verify");
            return;

        }

        finish(target);

    }

    return {
        t, ready, signed, step, next, back, submit, change, values, errors, plan, planId, setPlanId, duration, setDuration, durations,
        code, setCode, apply, applied, method, setMethod, currency, setCurrency, options, currencies: choices.currencies, challenge,
        verified: ( target: string | null ) => finish(target),
        stage: ( index: number, at: number ) => (index < at ? "done" : index === at ? "current" : "next") as "done" | "current" | "next",
        plans: rows.map(( row ) => ({
            id: row.id, name: row.name ?? t("untitled"), description: row.description ?? null, free: row.free === true,
        })),
        plansLoading: plans.loading && !plans.data,
        plansFailed: Boolean(plans.error),
        reloadPlans: plans.reload,
        gatewaysLoading: gateways.loading && !gateways.data,
        checking: check.pending,
        couponError: check.error ? t("couponInvalid") : null,
        pending: action.pending,
        error: Object.keys(action.error?.errors ?? {}).some(( key ) => key in blank) ? null : failure,
        unavailable: Boolean(plan && !price),
        summary: plan ? {
            name: plan.name ?? t("untitled"),
            duration: t(`durations.${duration}`),
            price: label(price?.now),
            was: label(price?.was),
            discount: label(discount ? amountOf(discount.discount)?.amount : null),
            total: label(total),
            free,
        } : null,
        loginHref: `${localePath(locale, links.login, routing)}?${new URLSearchParams({ next: `${pathname}?${query.toString()}` })}`,
        plansHref: localePath(locale, links.plans, routing),
    };

}
