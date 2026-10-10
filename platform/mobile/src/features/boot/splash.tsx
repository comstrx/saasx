import { identity } from "@/brand/identity";
import { release } from "@/brand/release";
import { LaunchScreen } from "@/components/launch-screen";

export function Splash () {
    const year = new Date().getFullYear();
    const span = year > identity.since ? `${ identity.since }–${ year }` : `${ year }`;

    return <LaunchScreen copyright={`© ${ span }  ${ identity.site }`} version={`v${ release.version }`} />;

}
