import type { Device, Info, Watched } from "engine/device";
import { useEffect, useState } from "react";

export type Fact = Exclude<keyof Watched, "location"> & keyof Info;
export type DeviceBinding = { useDevice: () => Device; useDeviceFact: <K extends Fact>( fact: K ) => Info[K] };

export function bindDevice ( device: Device ): DeviceBinding {

    return {
        useDevice: () => device,
        useDeviceFact: <K extends Fact>( fact: K ): Info[K] => {

            const [value, setValue] = useState<Info[K]>(() => device.info()[fact]);

            useEffect(() => device.watch(fact, ( next ) => setValue(next as unknown as Info[K])), [fact]);

            return value;

        },
    };

}
