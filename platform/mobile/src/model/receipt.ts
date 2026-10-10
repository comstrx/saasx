import type { Picture } from "@/model/catalog";
import { baseCurrency } from "@/model/currency";
import { dead, type Order, type OrderLeg } from "@/model/order";

export type CheckoutReceipt = {
    order: number;
    type: string;
    reference: string;
    title: string;
    image: Picture | null;
    starts: string;
    ends: string;
    adults: number;
    children: number;
    infants: number;
    pets: number;
    nights: number;
    tax: number;
    total: number;
    paid: number;
    currency: string;
    payment: string;
    createdAt: string;
};

export type ReceiptPhase = "settling" | "failed" | "declined" | "paid" | "partial";

export const receiptFromOrder = ( order: Order ): CheckoutReceipt => ({
    order: order.id,
    type: order.type,
    reference: order.reference,
    title: order.title,
    image: order.image,
    starts: order.startsAt ?? "",
    ends: order.endsAt ?? "",
    adults: order.adults,
    children: order.children,
    infants: order.infants,
    pets: order.pets,
    nights: order.nights,
    tax: order.tax?.amount ?? 0,
    total: order.total?.amount ?? 0,
    paid: order.paidAmount?.amount ?? 0,
    currency: order.total?.currency ?? order.paidAmount?.currency ?? baseCurrency,
    payment: order.gateway,
    createdAt: order.paidAt ?? order.at ?? "",
});

const lastCharge = ( order: Order ): OrderLeg | null =>
    order.legs.filter(( leg ) => leg.kind === "pay" ).reduce<OrderLeg | null>(( last, leg ) => !last || leg.id > last.id ? leg : last, null);

export const receiptPhase = ( order: Order, awaiting: boolean ): ReceiptPhase => {

    if ( dead(order.state) ) return "failed";
    if ( order.paid ) return "paid";

    const charge = lastCharge(order)?.status;

    if ( charge === "failed" ) return "declined";

    return awaiting || charge === "pending" ? "settling" : "partial";

};

export const troubled = ( phase: ReceiptPhase ): boolean => phase === "failed" || phase === "declined";

export const receiptDue = ( receipt: CheckoutReceipt ): number =>
    Math.max(0, receipt.total - receipt.paid);

export const receiptHasStay = ( receipt: CheckoutReceipt ): boolean =>
    Boolean(receipt.title || receipt.starts || receipt.ends);
