"use client";

import BookingSummary from "@/components/booking-summary";
import FactList from "@/components/fact-list";
import FormAction from "@/components/form-action";
import FormPanel from "@/components/form-panel";
import FormRetry from "@/components/form-retry";
import FormSection from "@/components/form-section";
import OrderActions from "@/components/order-actions";
import OrderAmendments from "@/components/order-amendments";
import OrderContact from "@/components/order-contact";
import OrderDocuments from "@/components/order-documents";
import OrderFeedback from "@/components/order-feedback";
import OrderHelp from "@/components/order-help";
import OrderLines from "@/components/order-lines";
import OrderReview from "@/components/order-review";
import PriceSummary from "@/components/price-summary";
import SectionSkeleton from "@/components/section-skeleton";
import SignInPrompt from "@/components/sign-in-prompt";
import StateNotice from "@/components/state-notice";
import TaskLayout from "@/components/task-layout";
import type { CheckoutLinks } from "../hooks/use-checkout-route";
import { useOrderDetail } from "../hooks/use-order-detail";
import Payment from "./payment";

type Props = {
    id: string | undefined; title: string; icon: string | null; tone?: "teal" | "blue" | "ember" | "green" | "amber" | "red";
    links: CheckoutLinks;
};

export default function OrderDetail ({ id, title, icon, tone, links }: Props) {

    const result = useOrderDetail(id, links);
    const { t, common, request } = result;

    if ( result.state === "missing" ) return <StateNotice level={1} title={t("missingTitle")} description={t("missingOrder")} />;
    if ( result.state === "loading" ) return <FormPanel title={title}><SectionSkeleton /></FormPanel>;

    if ( result.state === "guest" ) return (

        <SignInPrompt level={1} title={title} description={t("orderSignIn")} label={t("signIn")} art={links.art} href={result.login} />

    );
    if ( result.state === "failed" ) return (

        <FormPanel title={title}>

            <FormRetry id="order-failure" message={common("failedBody")} label={common("retry")} onRetry={request.reload} />

        </FormPanel>

    );

    const { order, total, rows } = result;

    return (

        <TaskLayout
            title={t("orderReference", { id: order.id })} description={result.description}
            label={t("summary")} back={result.back} asideFirst progress={result.progress} icon={icon} tone={tone}
            aside={(

                <BookingSummary name={order.catalog?.name || order.name || title} image={order.catalog?.image || order.image}>

                    {total ? (

                        <PriceSummary
                            title={t("priceTitle")} lines={rows} total={{ key: "total", label: t("total"), amount: total }}
                            currencyLabel={result.currencyLabel}
                        />

                    ) : null}

                </BookingSummary>

            )}
            support={<OrderHelp orderId={order.id} links={result.help.links} labels={result.help.labels} />}
        >

            <FormSection title={t("detailsTitle")}>

                <FactList compact items={result.facts} />

            </FormSection>

            {order.can_pay ? <Payment orderId={order.id} /> : null}

            <OrderDocuments key={`documents-${order.id}`} order={order} />
            <OrderContact order={order} onChanged={request.reload} />
            <OrderLines order={order} path={links.order} />

            <OrderAmendments order={order} onChanged={request.reload} />
            <OrderActions order={order} onChanged={request.reload} />
            <OrderReview key={`review-${order.id}`} order={order} onChanged={request.reload} />
            <OrderFeedback orderId={order.id} name={t("orderReference", { id: order.id })} />

            <FormAction label={t("refreshOrder")} onClick={request.reload} pending={request.loading} />

        </TaskLayout>

    );

}
