const short = /^#([\da-f])([\da-f])([\da-f])$/i;
const full = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i;
const clear = /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)$/i;

const channelsOf = ( color: string ): number[] | null => {

    const parts = full.exec(color) ?? short.exec(color);

    return parts ? parts.slice(1, 4).map(( part ) => Number.parseInt(part.length === 1 ? part + part : part, 16) ) : null;

};

const hex = ( channel: number ): string => Math.round(Math.max(0, Math.min(255, channel))).toString(16).padStart(2, "0");

export const alpha = ( color: string, amount: number ): string => {

    const channels = channelsOf(color);

    if ( !channels ) return color;

    return `rgba(${ channels.join(", ") }, ${ Math.max(0, Math.min(1, amount)) })`;

};

export const over = ( color: string, base: string ): string => {

    const ground = channelsOf(base);
    const layer = clear.exec(color);

    if ( !ground || !layer ) return color;

    const weight = Number(layer[4]);

    return `#${ ground.map(( channel, index ) => hex(channel + ( Number(layer[index + 1]) - channel ) * weight) ).join("") }`;

};
