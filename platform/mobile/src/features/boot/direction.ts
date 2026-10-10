import { I18nManager } from "react-native";
import { shippedLocales } from "@/brand/i18n";
import { currencies } from "@/model/currency";
import { isRtl, usePrefs } from "@/store/prefs";

const supported = {
    languages: shippedLocales,
    currencies: currencies.map(( currency ) => currency.code ),
};

usePrefs.getState().seed(supported);

const wanted = isRtl(usePrefs.getState().language);

if ( I18nManager.isRTL !== wanted ) {

    I18nManager.allowRTL(wanted);
    I18nManager.forceRTL(wanted);

}

let turned = false;

export const turning = (): boolean => turned;

export const face = ( language: string ) => {

    const next = isRtl(language);

    if ( next === I18nManager.isRTL ) return;

    turned = true;

    I18nManager.allowRTL(next);
    I18nManager.forceRTL(next);

};
