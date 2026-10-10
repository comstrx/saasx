"use client";

import { useSearchParams } from "next/navigation";

export function useRoomList () {

    const query = useSearchParams();

    return ( href: string | null ): string | null => {

        if ( !href ) return null;

        const [path = "", rest = ""] = href.split("?");
        const [search = "", hash = ""] = rest.split("#");
        const params = new URLSearchParams(search);

        for ( const key of ["from", "to", "adults", "children", "quantity"] ) {

            const value = query.get(key);

            if ( value !== null ) params.set(key, value);
            else params.delete(key);

        }

        return `${path}?${params}${hash ? `#${hash}` : ""}`;

    };

}
