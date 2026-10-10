"use client";

import AttemptRecovery from "@/components/attempt-recovery";
import FormPanel from "@/components/form-panel";
import FormRetry from "@/components/form-retry";
import FormSection from "@/components/form-section";
import LinkCollection from "@/components/link-collection";
import Message from "@/components/message";
import NavigationLinks from "@/components/navigation-links";
import PaymentOverview from "@/components/payment-overview";
import PurchaseList from "@/components/purchase-list";
import RecordList from "@/components/record-list";
import SectionSkeleton from "@/components/section-skeleton";
import SettlementForm from "@/components/settlement-form";
import SignInPrompt from "@/components/sign-in-prompt";
import StateNotice from "@/components/state-notice";
import TaskLayout from "@/components/task-layout";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { money } from "@/lib/std/format";
import { useCartPurchasePage } from "../hooks/use-cart-purchase-page";
import type { CheckoutLinks } from "../hooks/use-checkout-route";
import CartCheckout from "./cart-checkout";

type Props = { title: string; links: CheckoutLinks };

export default function CartPurchase ({ title, links }: Props) {

    const state = useCartPurchasePage(links);
    const t = useTranslations("cartPurchase");
    const cart = useTranslations("cart");
    const common = useTranslations("common");
    const locale = useLocale();
    const currencies = new Intl.DisplayNames([locale], { type: "currency" });
    const { purchase } = state;

    if ( !state.ready ) return <FormPanel title={title}><SectionSkeleton /></FormPanel>;

    if ( !state.token ) return <SignInPrompt
        level={1} title={title} description={cart("signInBody")} href={state.login} label={cart("signIn")} art={links.art}
    />;
    if ( state.parsed === null ) return <FormPanel title={title}><StateNotice
        title={t("invalidTitle")} description={t("invalidBody")}
        action={<NavigationLinks items={[{ href: state.cart, label: cart("back") }]} />}
    /></FormPanel>;

    if ( !purchase.ready || state.expanding ) return <FormPanel title={title}><SectionSkeleton /></FormPanel>;

    if ( purchase.result ) {

        const result = purchase.result;
        const total = result.currency ? money(result.total, locale, result.currency, true) : null;
        const paid = result.currency ? money(result.paid, locale, result.currency, true) : null;

        return <TaskLayout
            title={t("resultTitle")} description={t(result.failed.length ? "partial" : "created")} label={t("summary")} asideFirst
            back={{ href: state.cart, label: cart("back") }}
            aside={<PaymentOverview title={t("summary")} rows={[
                ...(total ? [{ label: t("total"), amount: total }] : []),
                ...(paid ? [{ label: t("paid"), amount: paid }] : []),
            ]} note={t("resultHint")} />}
        >

            <RecordList label={t("bookings")} items={state.resultLinks} />
            {state.again ? <FormSection title={t("remainingTitle")} description={t("remainingBody", { count: result.failed.length })}>

                <LinkCollection label={t("remainingTitle")} items={[{ href: state.again, label: t("reviewRemaining") }]} />

            </FormSection> : null}

        </TaskLayout>;

    }
    if ( state.denied && !purchase.attempt && !purchase.blocked ) return <FormPanel title={title}><StateNotice
        title={cart("deniedTitle")} description={cart("deniedBody")}
        action={<NavigationLinks items={[{ href: state.cart, label: cart("back") }]} />}
    /></FormPanel>;
    if ( !state.ids.length ) return <FormPanel title={title}>

        {state.request.loading ? <SectionSkeleton /> : state.request.error ? <FormRetry
            id="cart-purchase-load" message={common("failedBody")} label={common("retry")} onRetry={state.request.reload}
        /> : <StateNotice
            title={t(state.total ? "limitTitle" : "emptyTitle")} description={t(state.total ? "limitBody" : "emptyBody")}
            action={<NavigationLinks items={[{ href: state.cart, label: cart("back") }]} />}
        />}

    </FormPanel>;
    if ( state.request.loading && !state.request.data && !purchase.attempt && !purchase.blocked ) return (
        <FormPanel title={title}><SectionSkeleton /></FormPanel>
    );
    if ( state.current && !purchase.locked ) return <CartCheckout
        key={state.current} id={String(state.current)} title={t("reviewTitle", {
            index: state.ids.indexOf(state.current) + 1, count: state.ids.length,
        })} links={links}
        group={{ review: purchase.reviews.find(( row ) => row.input.id === state.current), back: state.back, save: state.save }}
    />;

    return (

        <TaskLayout
            title={title} description={t("description")} label={t("summary")} back={{ href: state.cart, label: cart("back") }}
            asideFirst={!!purchase.attempt || purchase.blocked}
            aside={<PaymentOverview title={t("summary")} rows={state.totals} note={t("partialHint")}>

                {purchase.attempt || purchase.blocked ? <AttemptRecovery
                    title={t("recoveryTitle")} description={state.recoveryMessage}
                    label={t("retry")} pending={purchase.pending} blocked={purchase.blocked || !state.allowed} onRetry={state.submit}
                /> : <>

                    {state.remaining ? <Message>{t("needsReviews", { count: state.remaining })}</Message> : null}
                    {!state.allowed ? <Message>{t("denied")}</Message> : null}
                    <SettlementForm
                        {...state.confirmation} code={state.confirmation.code} onCode={state.confirmation.setCode}
                        method="wallet" kind="full" choices={[{ value: "full", label: t("confirm") }]} showPlans={false}
                        pending={purchase.pending} disabled={state.disabled} unresolved={false} message={state.message}
                        refresh={false} onKind={() => {}} onSubmit={state.submit} onRefresh={state.request.reload}
                        actionLabel={t("confirm")} pendingLabel={t("placing")} commitment={false}
                    />

                </>}

            </PaymentOverview>}
        >

            {state.request.error ? <FormRetry
                id="cart-purchase-refresh" message={common("failedBody")} label={common("retry")} onRetry={state.request.reload}
            /> : null}
            <PurchaseList
                label={t("items")} amountLabel={t("itemDueNow")}
                currencyName={( code ) => currencies.of(code) ?? code}
                items={state.rows.map(( row ) => ({
                    ...row, disabled: purchase.locked || !state.allowed || state.request.loading,
                    action: row.available && !row.excluded ? {
                        label: t(row.approved ? "editReview" : "reviewItem"), onClick: () => state.edit(row.id),
                    } : undefined,
                    secondary: { label: t(row.excluded ? "include" : "exclude"),
                        onClick: () => purchase.exclude(row.id, !row.excluded) },
                }))}
            />

        </TaskLayout>

    );

}
