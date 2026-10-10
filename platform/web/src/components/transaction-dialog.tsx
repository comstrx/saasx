"use client";

import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Facts from "@/elements/facts";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useTransactionDialog } from "@/hooks/use-transaction-dialog";
import Icon, { isIconName } from "@/icons/icon";
import ConfirmCode from "./confirm-code";
import FormFeedback from "./form-feedback";
import FormRetry from "./form-retry";
import ReportDialog from "./report-dialog";
import SectionSkeleton from "./section-skeleton";

type Props = {
    transactionId: number | null; close: string; retry: string; onClose: () => void; onChanged: () => void; onHide?: ( id: number ) => void;
};

export default function TransactionDialog ({ transactionId, close, retry, onClose, onChanged, onHide }: Props) {

    const state = useTransactionDialog(transactionId, onChanged);
    const { t, confirmation } = state;

    return (

        <Dialog
            open={transactionId != null} onOpenChange={( open ) => { if ( !open ) onClose(); }} title={t("details")} close={close}
            dismissible={!state.pending}
            footer={transactionId != null ? (

                <Stack direction="row" align="center" justify="between" gap={2} width="full" wrap>

                    <ReportDialog feature="transactions" id={transactionId} name={state.description ?? t("details")} />

                    {onHide ? (

                        <Button variant="ghost" size="small" rounded="full" onClick={() => onHide(transactionId)}>

                            <Icon name="eye-off" />{t("hide")}

                        </Button>

                    ) : null}

                </Stack>

            ) : undefined}
        >

            {state.failed ? (

                <FormRetry id="transaction-failure" message={t("unavailable")} label={retry} onRetry={state.reload} />

            ) : state.loading ? <SectionSkeleton /> : (

                <Stack gap={5}>

                    {state.description ? <Text weight="semibold" dir="auto">{state.description}</Text> : null}

                    <Facts
                        columns={2} compact
                        items={state.facts.map(( fact ) => ({
                            key: fact.key, term: fact.term, detail: fact.detail,
                            icon: isIconName(fact.icon) ? <Icon name={fact.icon} /> : undefined,
                        }))}
                    />

                    {state.free ? <Text size="small" tone="success">{state.free}</Text> : null}

                    <FormFeedback id="transaction-status" message={state.notice} error={state.error} />

                    {state.asked ? (

                        <Stack gap={4}>

                            <Text size="small" tone="muted">{t(state.asked === "cancel" ? "cancelBody" : "refundBody")}</Text>

                            {state.asked === "refund" && confirmation.challenge ? (

                                <ConfirmCode
                                    id={confirmation.id} challenge={confirmation.challenge} code={confirmation.code}
                                    retry={confirmation.retry} expired={confirmation.expired} disabled={state.pending}
                                    onCode={confirmation.setCode} onResend={() => { void state.run(true); }}
                                />

                            ) : null}

                            <Stack direction="row" gap={2} justify="end">

                                <Button variant="ghost" disabled={state.pending} onClick={() => state.setAsked(null)}>{t("keep")}</Button>

                                <Button
                                    variant={state.asked === "cancel" ? "danger" : "filled"} pending={state.pending}
                                    onClick={() => { void state.run(); }}
                                >

                                    {t(state.asked === "cancel" ? "cancel" : "refund")}

                                </Button>

                            </Stack>

                        </Stack>

                    ) : state.canCancel || state.canRefund ? (

                        <Stack direction="row" gap={2} justify="end" wrap>

                            {state.canRefund ? (

                                <Button variant="outlined" onClick={() => state.setAsked("refund")}>

                                    <Icon name="reply" />{t("refund")}

                                </Button>

                            ) : null}

                            {state.canCancel ? (

                                <Button variant="outlined" onClick={() => state.setAsked("cancel")}><Icon name="x" />{t("cancel")}</Button>

                            ) : null}

                        </Stack>

                    ) : null}

                </Stack>

            )}

        </Dialog>

    );

}
