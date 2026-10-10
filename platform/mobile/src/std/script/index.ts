type Script = "latin" | "arabic";

const arabic = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

const latin = /[a-z]/i;

export const scriptOf = ( value: unknown, fallback: Script ): Script => {

    const text = typeof value === "string"
        ? value
        : Array.isArray(value) ? value.filter(( part ) => typeof part === "string" ).join(" ") : "";

    if ( !text ) return fallback;
    if ( arabic.test(text) ) return "arabic";
    if ( latin.test(text) ) return "latin";

    return fallback;

};
