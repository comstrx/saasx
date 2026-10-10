import "server-only";

import registry from "@spec/registry";
import { type ComponentType, createElement, Fragment, type ReactNode, Suspense } from "react";
import { permissions } from "@/api/features";
import Block from "@/elements/block.tsx";
import type { FeatureProps, Route, Screen } from "@/lib/spec/feature";
import type { CompiledBlock, CompiledFeature } from "@/lib/spec/screens";
import { Boundary } from "./boundary";
import { Gate } from "./gate";

export type Facts = { screen: Screen; route: Route; loader: ReactNode };

type View = ComponentType<FeatureProps>;

export async function feature ( name: string ): Promise<View> {

    const entry = registry[name];

    if ( !entry ) throw new Error(`No feature named ${name} in the registry.`);

    return (await entry()).default as View;

}
function required ( name: string ): readonly string[] {

    return permissions[name as keyof typeof permissions] ?? [];

}
async function One ({ entry, facts }: { entry: CompiledFeature; facts: Facts }) {

    const Feature = await feature(entry.name);
    const place = { id: entry.id, heading: entry.heading };
    const held = entry.features.length + entry.blocks.length > 0;
    const children = held ? (

        <Fragment>

            <Features entries={entry.features} facts={facts} />

            <Blocks blocks={entry.blocks} facts={facts} />

        </Fragment>

    ) : undefined;

    return createElement(Feature, { options: entry.options, screen: facts.screen, route: facts.route, feature: place, children });

}
function Placed ({ entry, facts }: { entry: CompiledFeature; facts: Facts }) {

    const needed = required(entry.name);
    const view = (

        <Boundary name={entry.id}>

            <Suspense fallback={facts.loader}>

                <One entry={entry} facts={facts} />

            </Suspense>

        </Boundary>

    );

    return needed.length ? <Gate permissions={needed}>{view}</Gate> : view;

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
