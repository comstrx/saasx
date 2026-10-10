import { isRtl, usePrefs } from "@/store/prefs";

export const useScript = () => usePrefs(( state ) => isRtl(state.language) ? "arabic" : "latin" );
