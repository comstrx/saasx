import { type Href, router } from "expo-router";

const home: Href = "/";

export const retreat = ( fallback: Href = home ) => {

    if ( router.canGoBack() ) { router.back(); return; }

    router.replace(fallback);

};
