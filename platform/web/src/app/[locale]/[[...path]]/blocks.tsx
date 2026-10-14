import "server-only";

import registry from "@spec/registry";
import { type ComponentType, createElement, Fragment, type ReactNode, Suspense } from "react";
import Block from "@/elements/block";
import type { FeatureProps, Route, Screen } from "@/lib/spec/feature";
import type { CompiledWebBlock as CompiledBlock, CompiledWebFeature as CompiledFeature } from "@/lib/spec/surface";
import { Boundary } from "./boundary";
import { Gate } from "./gate";
import { Mount } from "./mount";

export type Facts = { screen: Screen; route: Route; loader: ReactNode };

type View = ComponentType<FeatureProps>;

export async function placed ( name: string, props: FeatureProps ): Promise<ReactNode> {

    const entry = registry[name];

    if ( !entry ) return <Mount name={name} {...props} />;

    return createElement((await entry()).default as View, props);

}
async function One ({ entry, facts }: { entry: CompiledFeature; facts: Facts }) {

    const place = { id: entry.id, slug: entry.slug, heading: entry.heading, access: entry.access };
    const held = entry.features.length + entry.blocks.length > 0;
    const children = held ? (

        <Fragment>

            <Features entries={entry.features} facts={facts} />

            <Blocks blocks={entry.blocks} facts={facts} />

        </Fragment>

    ) : undefined;

    return placed(entry.name, { options: entry.options, ports: entry.ports, screen: facts.screen, route: facts.route, feature: place, children });

}
function Placed ({ entry, facts }: { entry: CompiledFeature; facts: Facts }) {

    const one = <One entry={entry} facts={facts} />;
    const blocking = entry.heading && entry.owner === "server";
    const view = <Boundary name={entry.id}>{blocking ? one : <Suspense fallback={facts.loader}>{one}</Suspense>}</Boundary>;

    return entry.access.length ? <Gate access={entry.access}>{view}</Gate> : view;

}
function Features ({ entries, facts }: { entries: readonly CompiledFeature[]; facts: Facts }) {

    return entries.map(( entry ) => <Placed key={entry.id} entry={entry} facts={facts} />);

}
export function Blocks ({ blocks, facts }: { blocks: readonly CompiledBlock[]; facts: Facts }) {

    return blocks.map(( block ) => {

        const features = block.features.map(( entry ) => ({ id: entry.id, node: <Placed entry={entry} facts={facts} /> }));
        const children = block.blocks.map(( child ) => ({ id: child.id, node: <Blocks blocks={[child]} facts={facts} /> }));

        return <Block key={block.id} {...block.options} entries={[...features, ...children]} />;

    });

}
