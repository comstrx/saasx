"use client";

import Dialog from "@/elements/dialog";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useNotificationDetails } from "@/hooks/use-notification-details";
import { useTranslations } from "@/lib/providers/intl";
import FactList from "./fact-list";
import FormRetry from "./form-retry";
import SectionSkeleton from "./section-skeleton";

type Props = { notificationId: number | null; onClose: () => void };

export default function NotificationDetails ({ notificationId, onClose }: Props) {

    const data = useNotificationDetails(notificationId);
    const common = useTranslations("common");

    return (

        <Dialog
            open={notificationId != null} onOpenChange={( open ) => { if ( !open ) onClose(); }} title={data.title} close={common("close")}
        >

            {data.failed ? (

                <FormRetry id="notification-details" message={data.t("unavailable")} label={common("retry")} onRetry={data.reload} />

            ) : data.loading ? <SectionSkeleton /> : (

                <Stack gap={5}>

                    {data.body ? <Text dir="auto" wrap="pretty">{data.body}</Text> : null}

                    <FactList compact items={data.facts} />

                </Stack>

            )}

        </Dialog>

    );

}
