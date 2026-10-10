"use client";

import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useTranslations } from "@/lib/providers/intl";
import FormSection from "./form-section";
import ReactionToggle from "./reaction-toggle";
import ReportDialog from "./report-dialog";

type Props = { orderId: number; name: string };

export default function OrderFeedback ({ orderId, name }: Props) {

    const t = useTranslations("orders");

    return (

        <FormSection title={t("feedbackTitle")} description={t("feedbackBody")}>

            <ReactionToggle
                feature="orders" id={orderId}
                labels={{ question: t("reactionQuestion"), like: t("reactionLike"), dislike: t("reactionDislike") }}
            />

            <Stack direction="row" align="center" justify="between" gap={3} wrap>

                <Text as="span" size="small" tone="muted">{t("problemBody")}</Text>

                <ReportDialog feature="orders" id={orderId} name={name} />

            </Stack>

        </FormSection>

    );

}
