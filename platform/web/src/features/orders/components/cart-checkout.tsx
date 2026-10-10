"use client";

import FormPanel from "@/components/form-panel";
import FormRetry from "@/components/form-retry";
import NavigationLinks from "@/components/navigation-links";
import SectionSkeleton from "@/components/section-skeleton";
import SignInPrompt from "@/components/sign-in-prompt";
import StateNotice from "@/components/state-notice";
import { useTranslations } from "@/lib/providers/intl";
import { entityId } from "@/lib/std/route";
import { useCartCheckout } from "../hooks/use-cart-checkout";
import type { GroupReview } from "../hooks/use-cart-review";
import type { CheckoutLinks } from "../hooks/use-checkout-route";
import CartRecovery from "./cart-recovery";
import Review from "./review";

type Props = { id: string | undefined; title: string; links: CheckoutLinks; group?: GroupReview };

export default function CartCheckout ({ id, title, links, group }: Props) {

    const cartId = entityId(id);
    const state = useCartCheckout(cartId, links);
    const t = useTranslations("cart");
    const common = useTranslations("common");
    const denied = state.error?.status === 403 || !state.user?.permissions?.includes("view_carts");
    const allowed = !denied && !!state.user?.permissions?.includes("add_orders");
    const editable = !denied && !!state.user?.permissions?.includes("edit_carts");
    const recovery = !!state.action.attempt || !!state.action.receipt || state.action.blocked;
    const preparing = !!state.preparation.attempt || state.preparation.blocked;

    if ( !cartId ) return <FormPanel title={title}>
        <StateNotice title={t("missingTitle")} description={t("missingBody")} />
    </FormPanel>;

    if ( !state.ready ) return <FormPanel title={title}><SectionSkeleton /></FormPanel>;

    if ( !state.token || state.error?.status === 401 ) return <SignInPrompt
        level={1} title={title} description={t("signInBody")} href={state.login} label={t("signIn")} art={links.art}
    />;
    if ( !state.data && (recovery || preparing) ) return <CartRecovery
        title={title} back={state.back} links={links} action={state.action}
        preparation={state.preparation} allowed={allowed} editable={editable}
    />;
    if ( denied && !recovery && !preparing ) return <FormPanel title={title}><StateNotice
        title={t("deniedTitle")} description={t("deniedBody")}
        action={<NavigationLinks items={[{ href: state.back, label: t("back") }]} />}
    /></FormPanel>;
    if ( state.data ) return <Review
        key={state.user?.id} data={state.data.purchase} query={state.query} back={group?.back ?? state.back}
        productHref={state.productHref} title={title} links={links} group={group}
        action={state.action} cart={{ item: state.data.item, mutation: state.preparation, editable }}
        disabled={!allowed || state.disabled && !recovery && !preparing}
        notice={!allowed ? { message: t("purchaseDenied") }
            : state.error ? { message: t("refreshFailed"), retry: state.reload } : undefined}
    />;

    if ( !state.action.ready || !state.preparation.ready || state.pending ) return <FormPanel title={title}><SectionSkeleton /></FormPanel>;

    if ( state.unavailable ) return <FormPanel title={title}><StateNotice
        title={t("missingTitle")} description={t("missingBody")}
        action={<NavigationLinks items={[{ href: state.back, label: t("back") }]} />}
    /></FormPanel>;

    return <FormPanel title={title}>

        <FormRetry id="cart-checkout-read" message={common("failedBody")} label={common("retry")} onRetry={state.reload} />

    </FormPanel>;

}
