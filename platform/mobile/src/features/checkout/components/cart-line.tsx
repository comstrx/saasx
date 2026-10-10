import { useTranslation } from "react-i18next";
import { BasketItem } from "@/components/basket-item";
import type { IconName } from "@/elements/icon";
import { useMoney } from "@/features/shell/hooks/use-money";
import { type CartLine, capped, indicative } from "@/model/cart";
import { priced, unitOf } from "@/model/catalog";
import type { Need } from "@/model/requirement";

const needGlyphs: Readonly<Record<Need, IconName>> = {
    dates: "calendar",
    guests: "users",
    applicants: "user",
};

type CartLineRowProps = {
    line: CartLine;
    picked?: boolean;
    onPick?: (() => void) | undefined;
    icon?: IconName | undefined;
    need?: Need | undefined;
    busy?: boolean;
    summary?: string;
    ready?: boolean;
    onOpen?: (() => void) | undefined;
    onEdit?: (() => void) | undefined;
    onQuantity: ( quantity: number ) => void;
    onRemove: () => void;
};

export function CartLineRow ({ line, icon, need, busy = false, summary = "", ready = true, picked = true, onPick, onOpen, onEdit, onQuantity, onRemove }: CartLineRowProps) {

    const { t } = useTranslation();
    const cash = useMoney();
    const listing = line.listing;
    const unit = line.unit ?? listing.price;
    const total = line.total;
    const measure = unitOf(listing.unit) ? t(`listing.unit.${ listing.unit }`, { defaultValue: "" }) : "";
    const low = listing.stock !== null && listing.stock <= 5;

    return (
        <BasketItem
            title={listing.name}
            note={listing.place}
            image={listing.image}
            icon={icon}
            unit={priced(unit) && unit ? [ cash.amount(unit.amount, unit.currency), measure ].filter(Boolean).join(" ") : t("listing.onRequest")}
            amount={priced(total) && total ? cash.amount(total.amount, total.currency) : undefined}
            was={line.was ? cash.amount(line.was.amount, line.was.currency) : undefined}
            amountLabel={t("checkout.grandTotal")}
            amountLead={indicative(line) ? t("details.from") : undefined}
            unpriced={t("cart.noPrice")}
            status={low ? { label: capped(line) ? t("cart.capped") : t("cart.stock", { count: listing.stock ?? 0 }), tone: capped(line) ? "danger" : "warning" } : undefined}
            selection={onPick ? { checked: picked, label: t("cart.include"), onChange: onPick } : undefined}
            detail={onEdit ? { label: t(ready ? "cart.factsSet" : "cart.factsMissing"), note: summary, ready, icon: need ? needGlyphs[need] : undefined, onPress: onEdit } : undefined}
            quantity={{ value: line.quantity, min: line.minimum, max: line.maximum ?? undefined, label: t("cart.quantity"), onChange: onQuantity }}
            remove={{ label: t("cart.remove"), onPress: onRemove }}
            busy={busy}
            onOpen={onOpen}
        />
    );

}
