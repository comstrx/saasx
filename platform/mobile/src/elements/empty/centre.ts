export type Shift = {
    top: number;
    bottom: number;
};

export const settledShift: Shift = { top: 0, bottom: 0 };

export const shiftOf = ( seat: { top: number; tall: number }, block: number, floor: number, last: Shift ): Shift => {

    const free = seat.tall - block;

    if ( free <= last.top + last.bottom + 1 ) return settledShift;

    const room = free - 2;
    const over = Math.round(seat.top + seat.tall - floor);

    return over > 0 ? { top: 0, bottom: Math.min(over, room) } : { top: Math.min(-over, room), bottom: 0 };

};
