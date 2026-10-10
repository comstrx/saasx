const icons = {
    airport: "airplane", station: "train", bus_station: "bus", museum: "camera", gallery: "images", monument: "star",
    attraction: "star", viewpoint: "camera", mall: "bag", market: "store", restaurant: "coffee", cafe: "coffee", hotel: "bed",
    religious: "buildings", park: "compass", beach: "sun", stadium: "ticket", theatre: "ticket", hospital: "plus", parking: "parking",
    university: "buildings",
} as const;

export type PlaceKind = keyof typeof icons;

export function placeKind ( kind: string | null | undefined ): PlaceKind | undefined {

    return (Object.keys(icons) as PlaceKind[]).find(( key ) => key === kind);

}
export function placeIcon ( kind: string | null | undefined ): string {

    const known = placeKind(kind);

    return known ? icons[known] : "pin";

}
export function mapsLink ( latitude: string | number | null | undefined, longitude: string | number | null | undefined ): string | null {

    const lat = Number(latitude);
    const lng = Number(longitude);

    if ( !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180 ) return null;

    return `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(6)},${lng.toFixed(6)}`;

}
