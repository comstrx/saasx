import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Linking } from "react-native";
import { identity } from "@/brand/identity";
import { routeOf } from "@/features/boot/deeplink";
import { settling } from "@/model/payment";
import { usePendingPayment } from "@/store/payment";
import { usePrefs } from "@/store/prefs";
import { useSession } from "@/store/session";

const linkedOf = ( url: string | null ): boolean =>
    url ? url.startsWith(`${ identity.scheme }://`) && routeOf(url) !== "" : false;

export function useEntry ( opened: boolean ) {

    const storyPending = usePrefs(( state ) => state.storyPending );
    const welcomed = usePrefs(( state ) => state.welcomed );
    const restored = useSession(( state ) => state.restored );
    const token = useSession(( state ) => state.token );
    const pending = usePendingPayment(( state ) => state.pending );
    const [ linked, setLinked ] = useState<boolean | null>(null);
    const sent = useRef(false);
    const resumed = useRef(false);
    const storyResumed = useRef(false);

    useEffect(() => {

        void Linking.getInitialURL().then(( url ) => setLinked(linkedOf(url)) );

    }, []);

    useEffect(() => {

        if ( sent.current || !opened || !restored || welcomed || token || linked !== false ) return;

        sent.current = true;
        router.replace("/gate");

    }, [ linked, opened, restored, token, welcomed ]);

    useEffect(() => {

        if ( !storyPending ) { storyResumed.current = false; return; }
        if ( storyResumed.current || !opened || !restored || !token ) return;

        storyResumed.current = true;
        router.replace("/story");

    }, [ storyPending, opened, restored, token ]);

    useEffect(() => {

        if ( resumed.current || !opened || !restored || !token || !settling(pending, Date.now()) ) return;

        resumed.current = true;
        router.push("/payment/return");

    }, [ opened, restored, token, pending ]);

}
