import { invoke } from "@tauri-apps/api/core";

export type HostInfo = {
    platform: "linux" | "macos" | "windows" | "unknown";
    arch: string;
    version: string;
    name: string;
};

let known: HostInfo | null = null;

export async function primeHost (): Promise<HostInfo | null> {

    if ( known ) return known;

    try {

        known = await invoke<HostInfo>("host_info");

    } catch {

        known = null;

    }

    return known;

}
export function hostInfo (): HostInfo | null {

    return known;

}
