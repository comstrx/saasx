"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import CartCheckout from "./components/cart-checkout";
import CartPurchase from "./components/cart-purchase";
import Checkout from "./components/checkout";
import OrderDetail from "./components/order-detail";
import OrderList from "./components/order-list";
import Upcoming from "./components/upcoming";

export const options = {
    view: "checkout", login: "/login", order: "/orders/:orderId", list: "/orders", cart: "/cart", browse: "/browse", limit: 12,
    group: "/cart/checkout", art: "/assets/images/brand/access.webp", success: "/assets/images/brand/celebrate.webp",
    empty: "/assets/images/brand/travel.webp", messages: "/messages", ticket: "/support/:ticketId",
    tone: "teal" as "teal" | "blue" | "ember" | "green" | "amber" | "red",
};

export default function Feature ({ options: chosen, screen, route }: FeatureProps<typeof options>) {

    if ( chosen.view === "upcoming" ) return <Upcoming order={chosen.order} list={chosen.list} />;
    if ( chosen.view === "purchase" ) return <CartPurchase title={screen.title} links={chosen} />;

    if ( chosen.view === "cart" ) return <CartCheckout
        key={route.parameters.cartId} id={route.parameters.cartId} title={screen.title} links={chosen}
    />;
    if ( chosen.view === "list" ) return (

        <OrderList title={screen.title} description={screen.description} icon={screen.icon ?? null} tone={chosen.tone} links={chosen} />

    );
    if ( chosen.view === "detail" ) return (

        <OrderDetail id={route.parameters.orderId} title={screen.title} icon={screen.icon ?? null} tone={chosen.tone} links={chosen} />

    );

    return <Checkout key={route.parameters.productId} id={route.parameters.productId} title={screen.title} links={chosen} />;

}
