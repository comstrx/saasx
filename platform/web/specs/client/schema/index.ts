import { defineSchema } from "../../../src/lib/spec/define.ts";
import about from "./about.ts";
import account from "./account.ts";
import activity from "./activity.ts";
import article from "./article.ts";
import blog from "./blog.ts";
import browse from "./browse.ts";
import campaign from "./campaign.ts";
import cart from "./cart.ts";
import cartCheckout from "./cart-checkout.ts";
import cartPurchase from "./cart-purchase.ts";
import categories from "./categories.ts";
import category from "./category.ts";
import checkout from "./checkout.ts";
import confirmEmail from "./confirm-email.ts";
import confirmEmailToken from "./confirm-email-token.ts";
import contact from "./contact.ts";
import coupons from "./coupons.ts";
import destination from "./destination.ts";
import destinations from "./destinations.ts";
import documents from "./documents.ts";
import events from "./events.ts";
import eventsItem from "./events-item.ts";
import experiences from "./experiences.ts";
import experiencesItem from "./experiences-item.ts";
import favorites from "./favorites.ts";
import home from "./home.ts";
import homes from "./homes.ts";
import homesItem from "./homes-item.ts";
import insurance from "./insurance.ts";
import insuranceItem from "./insurance-item.ts";
import login from "./login.ts";
import messages from "./messages.ts";
import missing from "./missing.ts";
import notificationSettings from "./notification-settings.ts";
import notifications from "./notifications.ts";
import offer from "./offer.ts";
import offers from "./offers.ts";
import order from "./order.ts";
import orders from "./orders.ts";
import place from "./place.ts";
import preferences from "./preferences.ts";
import privacy from "./privacy.ts";
import promo from "./promo.ts";
import promoItem from "./promo-item.ts";
import recover from "./recover.ts";
import referrals from "./referrals.ts";
import register from "./register.ts";
import reset from "./reset.ts";
import resetMail from "./reset-mail.ts";
import reviews from "./reviews.ts";
import rewards from "./rewards.ts";
import search from "./search.ts";
import security from "./security.ts";
import services from "./services.ts";
import servicesItem from "./services-item.ts";
import settings from "./settings.ts";
import shop from "./shop.ts";
import shopItem from "./shop-item.ts";
import socialCallback from "./social-callback.ts";
import stays from "./stays.ts";
import staysItem from "./stays-item.ts";
import support from "./support.ts";
import terms from "./terms.ts";
import ticket from "./ticket.ts";
import tickets from "./tickets.ts";
import ticketsItem from "./tickets-item.ts";
import transport from "./transport.ts";
import transportItem from "./transport-item.ts";
import vendor from "./vendor.ts";
import visas from "./visas.ts";
import visasItem from "./visas-item.ts";
import wallet from "./wallet.ts";

export default defineSchema({
    screens: [
        home,
        stays,
        staysItem,
        homes,
        homesItem,
        experiences,
        experiencesItem,
        events,
        eventsItem,
        tickets,
        ticketsItem,
        transport,
        transportItem,
        services,
        servicesItem,
        visas,
        visasItem,
        insurance,
        insuranceItem,
        shop,
        shopItem,
        browse,
        destinations,
        destination,
        place,
        categories,
        category,
        vendor,
        offers,
        offer,
        campaign,
        blog,
        article,
        about,
        contact,
        terms,
        privacy,
        favorites,
        account,
        settings,
        security,
        documents,
        notificationSettings,
        notifications,
        messages,
        wallet,
        rewards,
        coupons,
        referrals,
        support,
        ticket,
        reviews,
        activity,
        preferences,
        cart,
        cartCheckout,
        cartPurchase,
        checkout,
        order,
        orders,
        search,
        socialCallback,
        promoItem,
        promo,
        confirmEmailToken,
        confirmEmail,
        resetMail,
        reset,
        recover,
        register,
        login,
        missing,
    ],
});
