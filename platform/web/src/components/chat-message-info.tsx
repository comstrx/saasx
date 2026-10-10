"use client";

import Dialog from "@/elements/dialog";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import FactList from "./fact-list";
import FormRetry from "./form-retry";
import SectionSkeleton from "./section-skeleton";

type Props = {
    open: boolean;
    loading: boolean;
    failed: boolean;
    text: string | null;
    facts: readonly { key: string; term: string; detail?: string; icon?: string }[];
    labels: { title: string; close: string; retry: string; unavailable: string };
    onClose: () => void;
    onReload: () => void;
};

export default function ChatMessageInfo ({ open, loading, failed, text, facts, labels, onClose, onReload }: Props) {

    return (

        <Dialog open={open} onOpenChange={( next ) => { if ( !next ) onClose(); }} title={labels.title} close={labels.close} size="small">

            {failed ? <FormRetry id="message-info" message={labels.unavailable} label={labels.retry} onRetry={onReload} />
                : loading ? <SectionSkeleton /> : (

                    <Stack gap={5}>

                        {text ? <Text tone="muted" clamp={4} dir="auto">{text}</Text> : null}

                        <FactList compact items={facts} />

                    </Stack>

                )}

        </Dialog>

    );

}
