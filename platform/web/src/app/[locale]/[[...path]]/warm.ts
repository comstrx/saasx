import loads, { screens } from "@spec/preload";
import { linkedFeatures } from "engine/screen";
import { routing } from "@/lib/spec/config";

const started = new Set<string>();

export function warm ( current: string ): void {

    const links = [...document.links].filter(( link ) => link.origin === location.origin && link.pathname !== current);

    for ( const name of linkedFeatures(links.map(( link ) => link.pathname), screens, routing) ) {

        if ( started.has(name) ) continue;

        started.add(name);
        loads[name]?.().catch(() => started.delete(name));

    }

}
