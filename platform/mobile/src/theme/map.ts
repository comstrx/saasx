import type { Roles } from "@/theme/roles";

export type MapStyler = {
    featureType?: string;
    elementType?: string;
    stylers: Record<string, string>[];
};

const paint = ( color: string ) => [ { color } ];

const hidden = [ { visibility: "off" } ];

export const cartography = ({ terrain }: Roles ): MapStyler[] => [
    { elementType: "geometry", stylers: paint(terrain.land) },
    { elementType: "labels.text.fill", stylers: paint(terrain.label) },
    { elementType: "labels.text.stroke", stylers: paint(terrain.land) },
    { featureType: "administrative", elementType: "geometry.stroke", stylers: paint(terrain.border) },
    { featureType: "poi", elementType: "labels.icon", stylers: hidden },
    { featureType: "poi.business", stylers: hidden },
    { featureType: "poi.park", elementType: "geometry", stylers: paint(terrain.green) },
    { featureType: "road", elementType: "geometry", stylers: paint(terrain.road) },
    { featureType: "road", elementType: "geometry.stroke", stylers: paint(terrain.curb) },
    { featureType: "road", elementType: "labels.icon", stylers: hidden },
    { featureType: "road.highway", elementType: "geometry", stylers: paint(terrain.highway) },
    { featureType: "transit", stylers: hidden },
    { featureType: "water", elementType: "geometry", stylers: paint(terrain.water) },
    { featureType: "water", elementType: "labels.text.fill", stylers: paint(terrain.label) },
];
