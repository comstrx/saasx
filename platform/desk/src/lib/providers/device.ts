import { type Adapter, createDevice, type Device, type Info, webAdapter } from "engine/device";
import { hostInfo } from "./host.ts";

const web = webAdapter();

function info (): Info {

    const host = hostInfo();
    const base = web.info();

    if ( !host ) return base;

    return { ...base, platform: "desktop", os: host.platform, version: host.version, model: host.arch };

}

const adapter: Adapter = { ...web, info };

export const device: Device = createDevice(adapter);
