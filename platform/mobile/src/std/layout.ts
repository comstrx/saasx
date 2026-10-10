export const gridSpan = ( width: number, inset: number, gap: number, columns = 2 ): number =>
    Math.max(0, Math.floor(( width - inset * 2 - gap * ( columns - 1 ) ) / columns ));
