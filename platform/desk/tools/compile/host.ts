export type Window = {
    label: string;
    title: string;
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    resizable: boolean;
    decorations: boolean;
};
export type Capability = { identifier: string; windows: string[]; permissions: string[] };
export type Host = {
    productName: string;
    identifier: string;
    app: { windows: Window[]; security: { capabilities: Capability[] } };
};
export type HostInput = {
    identity: string;
    name: string;
    app: { slug: string; identifier: string };
    window: Omit<Window, "label" | "title">;
    permissions: readonly string[];
};

export const granted = ["core:default"] as const;
export const label = "main";
export const program = "desk";

export function binary ( identity: string ): string {

    return `${program}-${identity}`;

}

export function hostConfig ({ identity, name, app, window, permissions }: HostInput ): Host {

    const allowed = [...new Set([...granted, ...permissions])].sort();

    return {
        productName: binary(identity),
        identifier: app.identifier,
        app: {
            windows: [{ label, title: name, ...window }],
            security: { capabilities: [{ identifier: app.slug, windows: [label], permissions: allowed }] },
        },
    };

}
