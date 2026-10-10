export const digitsLocale = ( locale: string ): string =>
    locale.includes("-u-nu-") ? locale : `${ locale }-u-nu-latn`;
