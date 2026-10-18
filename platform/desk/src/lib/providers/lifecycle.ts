export function onBackground ( listener: () => void ): () => void {

    if ( typeof document === "undefined" ) return () => undefined;

    const hidden = (): void => {

        if ( document.visibilityState === "hidden" ) listener();

    };

    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", listener);

    return () => {

        document.removeEventListener("visibilitychange", hidden);
        window.removeEventListener("pagehide", listener);

    };

}
