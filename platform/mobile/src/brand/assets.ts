import { Image, type ImageRequireSource } from "react-native";

const logos = {
    light: require( "../../assets/image/brand/logo/wordmark-light.webp" ) as ImageRequireSource,
    dark: require( "../../assets/image/brand/logo/wordmark-dark.webp" ) as ImageRequireSource,
};

const glyph = require( "../../assets/image/brand/logo/mark.webp" ) as ImageRequireSource;

const ratioOf = ( source: ImageRequireSource ): number => {

    const shape = Image.resolveAssetSource?.(source);

    return shape && shape.height > 0 ? shape.width / shape.height : 1;

};

export const wordmark = {
    ...logos,
    ratio: ratioOf(logos.light),
};

export const mark = {
    source: glyph,
    ratio: ratioOf(glyph),
};

export const banners = {
    "story-stay-v3": {
        light: require( "../../assets/image/brand/story-v3/story-stay-v3.webp" ),
        dark: require( "../../assets/image/brand/story-v3/story-stay-v3.webp" ),
    },
    "story-travel-v3": {
        light: require( "../../assets/image/brand/story-v3/story-travel-v3.webp" ),
        dark: require( "../../assets/image/brand/story-v3/story-travel-v3.webp" ),
    },
    "story-visa-v3": {
        light: require( "../../assets/image/brand/story-v3/story-visa-v3.webp" ),
        dark: require( "../../assets/image/brand/story-v3/story-visa-v3.webp" ),
    },
    "story-insure-v3": {
        light: require( "../../assets/image/brand/story-v3/story-insure-v3.webp" ),
        dark: require( "../../assets/image/brand/story-v3/story-insure-v3.webp" ),
    },
    "story-product-v3": {
        light: require( "../../assets/image/brand/story-v3/story-product-v3.webp" ),
        dark: require( "../../assets/image/brand/story-v3/story-product-v3.webp" ),
    },

    "scene-market": {
        light: require( "../../assets/image/brand/v2/scene-market-soft.webp" ),
        dark: require( "../../assets/image/brand/v2/scene-market-soft.webp" ),
    },
    "scene-safety": {
        light: require( "../../assets/image/brand/v2/scene-safety.webp" ),
        dark: require( "../../assets/image/brand/v2/scene-safety.webp" ),
    },
    "scene-journey": {
        light: require( "../../assets/image/brand/v2/scene-journey.webp" ),
        dark: require( "../../assets/image/brand/v2/scene-journey.webp" ),
    },
    "scene-airport": {
        light: require( "../../assets/image/brand/v2/scene-airport.webp" ),
        dark: require( "../../assets/image/brand/v2/scene-airport.webp" ),
    },
    "scene-garden": {
        light: require( "../../assets/image/brand/v2/scene-garden.webp" ),
        dark: require( "../../assets/image/brand/v2/scene-garden.webp" ),
    },
    "stay": {
        light: require( "../../assets/image/brand/v2/stay.webp" ),
        dark: require( "../../assets/image/brand/v2/stay.webp" ),
    },
    "travel": {
        light: require( "../../assets/image/brand/v2/travel.webp" ),
        dark: require( "../../assets/image/brand/v2/travel.webp" ),
    },
    "visa": {
        light: require( "../../assets/image/brand/v2/passport.webp" ),
        dark: require( "../../assets/image/brand/v2/passport.webp" ),
    },
    "insure": {
        light: require( "../../assets/image/brand/v2/success.webp" ),
        dark: require( "../../assets/image/brand/v2/success.webp" ),
    },
    "product": {
        light: require( "../../assets/image/brand/v2/shopping.webp" ),
        dark: require( "../../assets/image/brand/v2/shopping.webp" ),
    },
} satisfies Record<string, Record<"light" | "dark", ImageRequireSource>>;

export type BannerName = keyof typeof banners;

export const art = {
    "auth-register-membership": {
        light: require( "../../assets/image/brand/auth/auth-register-membership.webp" ),
        dark: require( "../../assets/image/brand/auth/auth-register-membership.webp" ),
    },
    "auth-register-celebrate": {
        light: require( "../../assets/image/brand/auth/auth-register-celebrate.webp" ),
        dark: require( "../../assets/image/brand/auth/auth-register-celebrate.webp" ),
    },
    "auth-register-v4": {
        light: require( "../../assets/image/brand/auth/auth-register-v4.webp" ),
        dark: require( "../../assets/image/brand/auth/auth-register-v4.webp" ),
    },
    "auth-login-v3": {
        light: require( "../../assets/image/brand/auth/auth-login-v3.webp" ),
        dark: require( "../../assets/image/brand/auth/auth-login-v3.webp" ),
    },
    "auth-register-v3": {
        light: require( "../../assets/image/brand/auth/auth-register-v3.webp" ),
        dark: require( "../../assets/image/brand/auth/auth-register-v3.webp" ),
    },
    "auth-welcome": {
        light: require( "../../assets/image/brand/auth/auth-welcome.webp" ),
        dark: require( "../../assets/image/brand/auth/auth-welcome.webp" ),
    },
    "auth-lock": {
        light: require( "../../assets/image/brand/auth/auth-lock.webp" ),
        dark: require( "../../assets/image/brand/auth/auth-lock.webp" ),
    },
    "auth-key": {
        light: require( "../../assets/image/brand/auth/auth-key.webp" ),
        dark: require( "../../assets/image/brand/auth/auth-key.webp" ),
    },
    "auth-phone": {
        light: require( "../../assets/image/brand/auth/auth-phone.webp" ),
        dark: require( "../../assets/image/brand/auth/auth-phone.webp" ),
    },
    "auth-mail": {
        light: require( "../../assets/image/brand/auth/auth-mail.webp" ),
        dark: require( "../../assets/image/brand/auth/auth-mail.webp" ),
    },
    "auth-member": {
        light: require( "../../assets/image/brand/auth/auth-member-teal.webp" ),
        dark: require( "../../assets/image/brand/auth/auth-member-teal.webp" ),
    },
    "auth-enter": {
        light: require( "../../assets/image/brand/auth/auth-enter.webp" ),
        dark: require( "../../assets/image/brand/auth/auth-enter.webp" ),
    },
    "login": {
        light: require( "../../assets/image/brand/v2/login.webp" ),
        dark: require( "../../assets/image/brand/v2/login.webp" ),
    },
    "domain-browse": {
        light: require( "../../assets/image/brand/v2/nav-browse.webp" ),
        dark: require( "../../assets/image/brand/v2/nav-browse.webp" ),
    },
    "domain-hotel": {
        light: require( "../../assets/image/brand/v2/nav-hotel.webp" ),
        dark: require( "../../assets/image/brand/v2/nav-hotel.webp" ),
    },
    "domain-room": {
        light: require( "../../assets/image/brand/v2/nav-hotel.webp" ),
        dark: require( "../../assets/image/brand/v2/nav-hotel.webp" ),
    },
    "domain-property": {
        light: require( "../../assets/image/brand/v2/nav-property.webp" ),
        dark: require( "../../assets/image/brand/v2/nav-property.webp" ),
    },
    "domain-tour": {
        light: require( "../../assets/image/brand/v2/nav-tour.webp" ),
        dark: require( "../../assets/image/brand/v2/nav-tour.webp" ),
    },
    "domain-travel": {
        light: require( "../../assets/image/brand/v2/nav-travel.webp" ),
        dark: require( "../../assets/image/brand/v2/nav-travel.webp" ),
    },
    "domain-ticket": {
        light: require( "../../assets/image/brand/v2/nav-ticket.webp" ),
        dark: require( "../../assets/image/brand/v2/nav-ticket.webp" ),
    },
    "domain-visa": {
        light: require( "../../assets/image/brand/v2/nav-visa.webp" ),
        dark: require( "../../assets/image/brand/v2/nav-visa.webp" ),
    },
    "domain-product": {
        light: require( "../../assets/image/brand/v2/nav-product.webp" ),
        dark: require( "../../assets/image/brand/v2/nav-product.webp" ),
    },
    "domain-service": {
        light: require( "../../assets/image/brand/v2/nav-service.webp" ),
        dark: require( "../../assets/image/brand/v2/nav-service.webp" ),
    },
    "domain-event": {
        light: require( "../../assets/image/brand/v2/nav-event.webp" ),
        dark: require( "../../assets/image/brand/v2/nav-event.webp" ),
    },
    "domain-insurance": {
        light: require( "../../assets/image/brand/v2/nav-insurance.webp" ),
        dark: require( "../../assets/image/brand/v2/nav-insurance.webp" ),
    },

    "discovery": {
        light: require( "../../assets/image/brand/v2/discovery.webp" ),
        dark: require( "../../assets/image/brand/v2/discovery.webp" ),
    },
    "enter": {
        light: require( "../../assets/image/brand/v2/login.webp" ),
        dark: require( "../../assets/image/brand/v2/login.webp" ),
    },
    "member": {
        light: require( "../../assets/image/brand/v2/member.webp" ),
        dark: require( "../../assets/image/brand/v2/member.webp" ),
    },
    "mail": {
        light: require( "../../assets/image/brand/v2/mail.webp" ),
        dark: require( "../../assets/image/brand/v2/mail.webp" ),
    },
    "phone": {
        light: require( "../../assets/image/brand/v2/phone.webp" ),
        dark: require( "../../assets/image/brand/v2/phone.webp" ),
    },
    "key": {
        light: require( "../../assets/image/brand/v2/access.webp" ),
        dark: require( "../../assets/image/brand/v2/access.webp" ),
    },
    "lock": {
        light: require( "../../assets/image/brand/v2/access.webp" ),
        dark: require( "../../assets/image/brand/v2/access.webp" ),
    },
    "vault": {
        light: require( "../../assets/image/brand/v2/wallet.webp" ),
        dark: require( "../../assets/image/brand/v2/wallet.webp" ),
    },
} satisfies Record<string, Record<"light" | "dark", ImageRequireSource>>;

export type ArtName = keyof typeof art;

export const authentication: Partial<Record<ArtName, ArtName>> = { enter: "auth-login-v3", member: "auth-register-membership", mail: "auth-mail", phone: "auth-phone", key: "auth-key", lock: "auth-lock" };

export const emblems = {
    "bag": require( "../../assets/image/brand/v2/shopping.webp" ),
    "bell": require( "../../assets/image/brand/v2/bell.webp" ),
    "bulb": require( "../../assets/image/brand/v2/bulb.webp" ),
    "calendar": require( "../../assets/image/brand/v2/calendar.webp" ),
    "card": require( "../../assets/image/brand/services/wallet-v1.webp" ),
    "chart": require( "../../assets/image/brand/v2/chart.webp" ),
    "chat": require( "../../assets/image/brand/v2/chat.webp" ),
    "clock": require( "../../assets/image/brand/v2/clock.webp" ),
    "file": require( "../../assets/image/brand/v2/document.webp" ),
    "fire": require( "../../assets/image/brand/v2/gift.webp" ),
    "flash": require( "../../assets/image/brand/v2/flash.webp" ),
    "folder": require( "../../assets/image/brand/v2/folder.webp" ),
    "gift": require( "../../assets/image/brand/v2/gift.webp" ),
    "heart": require( "../../assets/image/brand/v2/heart.webp" ),
    "key": require( "../../assets/image/brand/v2/access.webp" ),
    "lock": require( "../../assets/image/brand/v2/access.webp" ),
    "lost": require( "../../assets/image/brand/v2/search.webp" ),
    "mail": require( "../../assets/image/brand/v2/mail.webp" ),
    "medal": require( "../../assets/image/brand/v2/celebrate.webp" ),
    "megaphone": require( "../../assets/image/brand/v2/megaphone.webp" ),
    "money": require( "../../assets/image/brand/services/wallet-v1.webp" ),
    "notice": require( "../../assets/image/brand/v2/error.webp" ),
    "offline": require( "../../assets/image/brand/v2/offline.webp" ),
    "phone": require( "../../assets/image/brand/v2/phone.webp" ),
    "place": require( "../../assets/image/brand/v2/search.webp" ),
    "receipt": require( "../../assets/image/brand/v2/document.webp" ),
    "rocket": require( "../../assets/image/brand/v2/celebrate.webp" ),
    "search": require( "../../assets/image/brand/v2/search.webp" ),
    "star": require( "../../assets/image/brand/v2/celebrate.webp" ),
    "suitcase": require( "../../assets/image/brand/v2/travel.webp" ),
    "support": require( "../../assets/image/brand/services/support-v1.webp" ),
    "tick": require( "../../assets/image/brand/v2/success.webp" ),
    "tool": require( "../../assets/image/brand/v2/error.webp" ),
    "trash": require( "../../assets/image/brand/v2/trash.webp" ),
    "trophy": require( "../../assets/image/brand/v2/celebrate.webp" ),
    "wallet": require( "../../assets/image/brand/services/wallet-v1.webp" ),
} satisfies Record<string, ImageRequireSource>;

export type EmblemName = keyof typeof emblems;
