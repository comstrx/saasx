import { I18nManager } from "react-native";

export function applyDirection ( rtl: boolean ): void {

    I18nManager.allowRTL(rtl);

    if ( I18nManager.isRTL !== rtl ) I18nManager.forceRTL(rtl);

}
