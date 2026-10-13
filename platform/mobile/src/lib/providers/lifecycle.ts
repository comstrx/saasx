/**
 * Off the device there is no foreground to leave; the native file answers on the phone.
 */
export function onBackground ( _listener: () => void ): () => void {

    return () => undefined;

}
