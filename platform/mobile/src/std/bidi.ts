export const isolateLtr = ( value: string | number ): string => {

    const text = String(value);

    return text ? `\u2066${ text }\u2069` : "";

};
