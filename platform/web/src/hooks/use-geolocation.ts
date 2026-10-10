"use client";

import { useState } from "react";

export function useGeolocation ( onFound: ( point: string ) => void ) {

    const [locating, setLocating] = useState(false);
    const [denied, setDenied] = useState(false);

    function locate () {

        if ( !("geolocation" in navigator) ) {

            setDenied(true);
            return;

        }

        setLocating(true);
        setDenied(false);
        navigator.geolocation.getCurrentPosition(( position ) => {

            setLocating(false);
            onFound(`${position.coords.latitude.toFixed(4)},${position.coords.longitude.toFixed(4)}`);

        }, () => {

            setLocating(false);
            setDenied(true);

        }, { maximumAge: 600000, timeout: 10000 });

    }

    return { locate, locating, denied };

}
