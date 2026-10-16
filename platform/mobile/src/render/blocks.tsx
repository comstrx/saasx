import registry from "@spec/registry";
import { placementOf } from "engine/screen";
import { type ComponentType, createElement, Fragment, lazy, type ReactNode, Suspense } from "react";
import Block from "@/elements/block";
import type { FeatureProps, Route, Screen } from "@/lib/spec/feature";
import type { CompiledAppBlock as CompiledBlock, CompiledAppFeature as CompiledFeature } from "@/lib/spec/surface";
import type { Palette } from "@/styles/theme";
import { Boundary } from "./boundary";
import { Gate } from "./gate";

export type Facts = { screen: Screen; route: Route; loader: ReactNode; palette: Palette };

type View = ComponentType<FeatureProps>;

const loaded = new Map<string, View>();

export function feature ( name: string ): View {

    const found = loaded.get(name);

    if ( found ) return found;

    const entry = registry[name];

    if ( !entry ) throw new Error(`No feature named ${name} in the registry.`);

    const view = lazy(async () => ({ default: (await entry()).default as View }));

    loaded.set(name, view);

    return view;

}
function One ({ entry, facts }: { entry: CompiledFeature; facts: Facts }) {

    const Feature = feature(entry.name);
    const held = entry.features.length + entry.blocks.length > 0;
    const children = held ? (

        <Fragment>

            <Features entries={entry.features} facts={facts} />

            <Blocks blocks={entry.blocks} facts={facts} />

        </Fragment>

    ) : undefined;

    const { screen, route } = facts;

    return createElement(Feature, { options: entry.options, ports: entry.ports, screen, route, feature: placementOf(entry), children });

}
function Placed ({ entry, facts }: { entry: CompiledFeature; facts: Facts }) {

    const view = (

        <Boundary name={entry.id}>

            <Suspense fallback={facts.loader}>

                <One entry={entry} facts={facts} />

            </Suspense>

        </Boundary>

    );

    return entry.access.length ? <Gate access={entry.access}>{view}</Gate> : view;

}
function Features ({ entries, facts }: { entries: readonly CompiledFeature[]; facts: Facts }) {

    return entries.map(( entry ) => <Placed key={entry.id} entry={entry} facts={facts} />);

}
export function Blocks ({ blocks, facts }: { blocks: readonly CompiledBlock[]; facts: Facts }) {

    return blocks.map(( block ) => {

        const features = block.features.map(( entry ) => ({ id: entry.id, node: <Placed entry={entry} facts={facts} /> }));
        const children = block.blocks.map(( child ) => ({ id: child.id, node: <Blocks blocks={[child]} facts={facts} /> }));

        return <Block key={block.id} {...block.options} palette={facts.palette} entries={[...features, ...children]} />;

    });

}
