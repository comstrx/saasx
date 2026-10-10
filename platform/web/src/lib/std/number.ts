export function asciiNumber ( value: string ): string {

    return value.replace(/[٠-٩۰-۹]/g, ( digit ) => {

        const code = digit.charCodeAt(0);

        return String(code >= 0x6f0 ? code - 0x6f0 : code - 0x660);

    }).replace(/٫/g, ".");

}
