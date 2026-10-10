import { useTranslation } from "react-i18next";
import { usePartyText } from "@/features/shell/copy";
import { useWhen } from "@/features/shell/hooks/use-when";
import { type Order, orderShape } from "@/model/order";

const kept = ( rows: readonly ( string | null )[] ): readonly string[] =>
    rows.filter(( row ): row is string => Boolean(row?.trim()) );

export function useOrderFacts ( order: Order | undefined ): readonly string[] {

    const { t } = useTranslation();
    const when = useWhen();
    const party = usePartyText();

    if ( !order ) return [];

    const guests = order.adults > 0 || order.children > 0 ? party(order.adults, order.children) : "";

    const shape = orderShape(order);

    if ( shape === "stay" ) return kept([
        t("details.nights", { count: order.nights }),
        guests || null,
        order.startsAt && order.endsAt ? t("details.brief.window", { from: when.date(order.startsAt), to: when.date(order.endsAt) }) : null,
    ]);

    if ( shape === "papers" ) return kept([
        t("orders.travellers", { count: order.travellers }),
        order.startsAt ? when.date(order.startsAt) : null,
    ]);

    if ( shape === "goods" ) return kept([
        order.quantity > 1 ? t("orders.units", { count: order.quantity }) : null,
        order.delivery ? t(`details.specs.way.${ order.delivery }`, { defaultValue: order.delivery }) : null,
    ]);

    if ( shape === "dated" ) return kept([
        when.moment(order.scheduledAt ?? order.startsAt),
        order.quantity > 1 ? t("orders.units", { count: order.quantity }) : null,
    ]);

    return kept([ order.quantity > 1 ? t("orders.units", { count: order.quantity }) : null ]);

}
