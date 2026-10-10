import { useTranslation } from "react-i18next";
import { Order } from "@/components/order";
import { glyphOf } from "@/features/catalog/marks";
import { useOrderFacts } from "@/features/orders/components/facts";
import { useMoney } from "@/features/shell/hooks/use-money";
import { type Order as Booking, dead, settled } from "@/model/order";
import { useDeal } from "@/query/contract";
import type { ToneName } from "@/theme/roles";

type OrderCardProps = {
    order: Booking;
    at: string;
    onPress: () => void;
    onPay?: (() => void) | undefined;
};

export function OrderCard ({ order, at, onPress, onPay }: OrderCardProps) {

    const { t } = useTranslation();
    const money = useMoney();

    const tint: ToneName = dead(order.state) ? "danger" : settled(order.state) ? "success" : "brand";
    const facts = useOrderFacts(order);
    const deal = useDeal(order.type);

    const deeds = order.canPay && onPay
        ? [ { key: "pay", label: t("orders.payNow"), onPress: onPay } ]
        : undefined;

    return (
        <Order
            title={order.title}
            reference={order.reference}
            state={{ label: t(`orders.state.${ order.state }`, { defaultValue: order.state }), tint }}
            when={at ? t("orders.placedAt", { at, context: deal }) : undefined}
            place={order.stage && !dead(order.state) ? t(`orders.stage.${ order.stage }`) : undefined}
            facts={facts}
            image={order.image}
            icon={glyphOf(order.type)}
            price={order.total ? money.amount(order.total.amount, order.total.currency) : undefined}
            deeds={deeds}
            onPress={onPress}
        />
    );

}
