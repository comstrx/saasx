"use client";

import { useState } from "react";
import type { Data } from "@/api/features";
import Button from "@/elements/button";
import Check from "@/elements/check";
import Dialog from "@/elements/dialog";
import Grid from "@/elements/grid";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import { useCartManager } from "@/hooks/use-cart-manager";
import { useLocale } from "@/lib/providers/intl";
import { entityLink } from "@/lib/spec/browser";
import { routing } from "@/lib/spec/config";
import { money } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { orderDate } from "@/lib/std/orders";
import AttemptRecovery from "./attempt-recovery";
import CartEditor from "./cart-editor";
import CartItem from "./cart-item";
import FormFeedback from "./form-feedback";

type Props = { checkout?: string; group?: string; items: readonly Data<"cart", "view">[]; total?: number | null; loading?: boolean };

export default function CartManager ({ items, total, loading, checkout, group }: Props) {

    const state = useCartManager(items);
    const { t, mutation } = state;
    const locale = useLocale();
    const currencyText = new Intl.DisplayNames([locale], { type: "currency" });
    const [editing, setEditing] = useState<Data<"cart", "view"> | null>(null);
    const [editorBusy, setEditorBusy] = useState(false);
    const locked = mutation.locked || !!loading || !!editing || editorBusy;
    const groupPath = group ? localePath(locale, group, routing) : null;
    const groupHref = groupPath && state.chosen.length ? `${groupPath}?${new URLSearchParams({
        items: state.chosen.join(","),
    })}` : groupPath;

    return (

        <Stack gap={5}>

            <CartEditor item={editing} onClose={() => setEditing(null)} onBusy={setEditorBusy} disabled={mutation.locked} />
            <FormFeedback id={state.id} message={state.message} error={state.error} />
            {mutation.attempt || mutation.blocked ? <AttemptRecovery
                title={t("recoveryTitle")} description={t(!state.canRecover ? "deniedBody" : mutation.blocked ? "blocked" : "recovery")}
                label={t("retry")} pending={mutation.pending} blocked={mutation.blocked || !state.canRecover} onRetry={state.recover}
            /> : null}
            {(state.canRemove || state.canPurchase) && items.length ? <Surface padding={3} radius="lg"><Stack
                direction="row" justify="between" align="center" gap={3} wrap
            >

                <Text size="small" tone="muted">{t("selected", { count: state.chosen.length })}</Text>
                <Stack direction="row" gap={2} wrap>

                    {state.canPurchase && groupHref ? locked ? <Button disabled>
                        {t(state.chosen.length ? "purchaseSelected" : "purchaseAll")}
                    </Button> : <Link href={groupHref} variant="filled">
                        {t(state.chosen.length ? "purchaseSelected" : "purchaseAll")}
                    </Link> : null}
                    {state.canRemove ? <>

                        <Button variant="outlined" disabled={locked || !state.chosen.length}
                            onClick={() => state.ask({ kind: "selected", ids: state.chosen })}>{t("removeSelected")}</Button>
                        <Button variant="ghost" disabled={locked} onClick={() => state.ask({ kind: "all" })}>{t("clear")}</Button>

                    </> : null}

                </Stack>

            </Stack></Surface> : null}
            <Grid columns={1} gap={4} label={t("list")}>

                {items.map(( item ) => {

                    const product = item.catalog;
                    const path = product ? entityLink("product", product) : null;
                    const price = item.live_total ?? item.total;
                    const amount = money(price, locale, product?.currency ?? "USD", true);
                    const from = orderDate(item.starts_at, locale);
                    const to = orderDate(item.ends_at, locale);
                    const maximum = Math.min(Number(product?.max_quantity) || 1000, 1000);
                    const minimum = Math.max(Number(product?.min_quantity) || 1, 1);
                    const adjustable = state.canEdit && !!product && !item.applicants?.length;
                    const quantity = Math.max(1, Number(item.quantity) || 1);
                    const name = product?.name || t("unavailableItem");

                    return <CartItem
                        key={item.id} name={name} image={product?.image} href={path ? localePath(locale, path, routing) : null}
                        amount={amount} currencyLabel={amount ? currencyText.of(amount.currency) ?? amount.currency : ""}
                        priceLabel={t("linePrice")}
                        unavailable={t("priceUnavailable")} quantity={quantity} minimum={minimum} maximum={maximum} disabled={locked}
                        description={from ? to ? t("dates", { from, to }) : from : undefined}
                        detail={item.applicants?.length ? t("travellers", { count: item.applicants.length })
                            : item.adults || item.children ? t("party", {
                                adults: item.adults ?? 0, children: item.children ?? 0,
                            }) : undefined}
                        labels={{
                            quantity: t("quantity"), decrease: t("decrease", { name }), increase: t("increase", { name }),
                            edit: t("edit"), remove: t("remove"),
                        }}
                        onQuantity={adjustable ? ( value ) => { void state.quantity(item, value); } : undefined}
                        purchase={state.canPurchase && product && checkout ? {
                            href: localePath(locale, checkout.replace(":cartId", String(item.id)), routing), label: t("reviewBooking"),
                        } : undefined}
                        onEdit={state.canEdit && product ? () => setEditing(item) : undefined}
                        onRemove={state.canRemove ? () => state.ask({ kind: "one", item }) : undefined}
                        selection={state.canRemove || state.canPurchase ? <Check id={`${state.id}-${item.id}`}
                            label={t("select", { name })} labelVisible={false} checked={state.chosen.includes(item.id)} disabled={locked}
                            onChange={( checked ) => state.select(item.id, checked)} /> : undefined}
                    />;

                })}

            </Grid>
            <Dialog
                open={!!state.removal && !mutation.attempt} onOpenChange={( open ) => { if ( !open ) state.close(); }}
                title={t("removeTitle")} close={t("cancel")}
                dismissible={!mutation.locked}
            >

                <Stack gap={4}>

                    <Text size="small" tone="muted">{state.removal?.kind === "one"
                        ? t("removeOne", { name: state.removal.item.catalog?.name || t("unavailableItem") })
                        : state.removal?.kind === "all" ? t("removeAll", { count: total ?? items.length })
                        : t("removeMany", { count: state.removal?.ids.length ?? 0 })}</Text>
                    <Button variant="outlined" disabled={mutation.locked} onClick={state.close}>{t("cancel")}</Button>
                    <Button pending={mutation.pending} disabled={mutation.locked} onClick={() => { void state.remove(); }}>
                        {t("confirmRemove")}
                    </Button>

                </Stack>

            </Dialog>

        </Stack>

    );

}
