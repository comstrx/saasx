import OfferDetail from "@/components/offer-detail";
import { getTranslations } from "@/lib/providers/intl-server";
import type { Route } from "@/lib/spec/feature";
import { detail } from "../hooks/use-board";

type Props = { route: Route };

export default async function Detail ({ route }: Props) {

    const [data, t, time] = await Promise.all([detail(route), getTranslations("offers"), getTranslations("time")]);

    if ( !data ) return null;

    return (

        <OfferDetail
            card={data.card} back={data.back} deals={data.deals} more={data.more}
            labels={{ ...data.labels, none: t("noDeals") }}
            units={{ days: time("days"), hours: time("hours"), minutes: time("minutes") }}
        />

    );

}
