"use client";

import CartManager from "@/components/cart-manager";
import CartSummary from "@/components/cart-summary";
import FormPanel from "@/components/form-panel";
import FormRetry from "@/components/form-retry";
import NavigationLinks from "@/components/navigation-links";
import Pager from "@/components/pager";
import SectionSkeleton from "@/components/section-skeleton";
import SignInPrompt from "@/components/sign-in-prompt";
import StateNotice from "@/components/state-notice";
import TaskLayout from "@/components/task-layout";
import { useCart } from "../hooks/use-cart";

type Props = {
    title: string; description: string; icon?: string | null; tone?: "teal" | "blue" | "ember" | "green" | "amber" | "red";
    options: { login: string; checkout: string; group: string; browse: string; limit: number; art: string };
};

export default function Cart ({ title, description, icon, tone, options }: Props) {

    const data = useCart(options);
    const { t, common, request } = data;

    if ( data.ready && (!data.token || data.expired) ) return <SignInPrompt
        level={1} title={title} description={t("signInBody")} href={data.login} label={t("signIn")} art={options.art}
    />;

    if ( data.denied ) return <FormPanel title={title}><StateNotice title={t("deniedTitle")} description={t("deniedBody")} /></FormPanel>;

    return (

        <TaskLayout title={title} description={description} icon={icon} tone={tone} label={t("summary")} aside={(
            <CartSummary
                title={t("summary")} count={t("items", { count: data.summary?.lines ?? data.items.length })}
                amount={data.amount} currencyLabel={data.currencyLabel} priceLabel={t("subtotal")} hint={t("priceHint")}
                unavailable={t("priceUnavailable")} browse={{ href: data.browse, label: t("browse") }}
            />
        )}>

            {!data.ready || request.loading && !request.data ? <SectionSkeleton /> : null}
            {request.error ? <FormRetry
                id="cart-failure" message={common("failedBody")} label={common("retry")} onRetry={request.reload}
            /> : null}
            <CartManager
                checkout={options.checkout} group={options.group} items={data.items}
                total={data.summary?.lines} loading={request.loading || !!request.error}
            />
            {data.ready && !request.loading && !request.error && !data.items.length ? <StateNotice
                title={t(data.page > 1 ? "pageEmptyTitle" : "emptyTitle")}
                description={t(data.page > 1 ? "pageEmptyBody" : "emptyBody")}
                action={<NavigationLinks items={[{
                    href: data.page > 1 ? "?" : data.browse, label: t(data.page > 1 ? "firstPage" : "browse"),
                }]} />}
            /> : null}
            {data.pager.previous || data.pager.next ? <Pager {...data.pager} /> : null}

        </TaskLayout>

    );

}
