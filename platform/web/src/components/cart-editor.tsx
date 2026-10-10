"use client";

import type { Data } from "@/api/features";
import Dialog from "@/elements/dialog";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import { useCartEditor } from "@/hooks/use-cart-editor";
import AttemptRecovery from "./attempt-recovery";
import CartFields from "./cart-fields";
import FormFeedback from "./form-feedback";
import FormRetry from "./form-retry";
import SectionSkeleton from "./section-skeleton";

type Props = {
    item: Data<"cart", "view"> | null; disabled?: boolean; onClose: () => void; onBusy?: ( busy: boolean ) => void;
};

export default function CartEditor ( props: Props ) {

    const state = useCartEditor(props);
    const { t, common, product, mutation } = state;
    const loaded = product.data?.product.id === props.item?.catalog?.id;

    return (

        <>

            <FormFeedback id={state.id} message={state.message} />
            <Dialog open={state.open} onOpenChange={( open ) => { if ( !open ) state.close(); }}
                title={t("edit")} close={t("close")} dismissible={!mutation.locked}>

                <Stack gap={5}>

                    {mutation.attempt || mutation.blocked ? <AttemptRecovery
                        title={t("recoveryTitle")}
                        description={t(!state.allowed ? "deniedBody" : mutation.blocked ? "blocked" : "recovery")}
                        label={t("retry")} pending={mutation.pending} blocked={mutation.blocked || !!props.disabled || !state.allowed}
                        onRetry={() => { void state.save(); }}
                    /> : null}
                    {!loaded && !mutation.attempt ? product.error ? <FormRetry
                        id={`${state.id}-read`} message={common("failedBody")} label={common("retry")} onRetry={product.reload}
                    /> : <SectionSkeleton /> : null}
                    {loaded && props.item && product.data ? <Surface
                        hidden={!!mutation.attempt || mutation.blocked} tone="clear" border={false} padding={0} radius="none"
                    >

                        <Stack gap={5}>

                            <Text size="small" weight="semibold" dir="auto">{product.data.product.name}</Text>
                            <CartFields key={props.item.id} item={props.item} product={product.data.product}
                                disabled={state.locked} onSave={( input ) => { void state.save(input); }} />

                        </Stack>

                    </Surface> : null}
                    <FormFeedback id={`${state.id}-failure`} error={state.error} />

                </Stack>

            </Dialog>

        </>

    );

}
