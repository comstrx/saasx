export type Point = { latitude: number; longitude: number };

const earth = 6_371_000;

const radians = ( degrees: number ): number => degrees * Math.PI / 180;

export const metersBetween = ( from: Point, to: Point ): number => {

    const north = radians(to.latitude - from.latitude);
    const east = radians(to.longitude - from.longitude);
    const arc = Math.sin(north / 2) ** 2 + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(east / 2) ** 2;

    return 2 * earth * Math.asin(Math.min(1, Math.sqrt(arc)));

};
