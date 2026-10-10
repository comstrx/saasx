"use client";

import FormPanel from "@/components/form-panel";
import FormRetry from "@/components/form-retry";
import SectionSkeleton from "@/components/section-skeleton";
import SignInPrompt from "@/components/sign-in-prompt";
import StateNotice from "@/components/state-notice";
import { useTranslations } from "@/lib/providers/intl";
import { entityId } from "@/lib/std/route";
import { type CheckoutLinks, useCheckoutRoute } from "../hooks/use-checkout-route";
import { useOrderAttempt } from "../hooks/use-order-attempt";
import Review from "./review";

type Props = { id: string | undefined; title: string; links: CheckoutLinks };

export default function Checkout ({ id, title, links }: Props) {

    const productId = entityId(id);
    const data = useCheckoutRoute(productId, links);
    const action = useOrderAttempt<"checkout" | "cart">("checkout", productId ?? 0);
    const t = useTranslations("checkout");
    const common = useTranslations("common");

    if ( !productId ) return <StateNotice level={1} title={t("missingTitle")} description={t("missingBody")} />;
    if ( !data.ready ) return <FormPanel title={title}><SectionSkeleton /></FormPanel>;

    if ( !data.token ) return (

        <SignInPrompt level={1} title={title} description={t("signInBody")} href={data.login} label={t("signIn")} art={links.art} />

    );

    if ( data.loading && !data.data ) return <FormPanel title={title}><SectionSkeleton /></FormPanel>;

    if ( data.error || !data.data ) return (

        <FormPanel title={title}>

            <FormRetry id="checkout-failure" message={common("failedBody")} label={common("retry")} onRetry={data.reload} />

        </FormPanel>

    );

    return <Review
        key={data.data.product.id} data={data.data} query={data.query} back={data.back} title={title} links={links} action={action}
    />;

}
