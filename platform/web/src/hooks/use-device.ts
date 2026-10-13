"use client";

import type { Device, Info, Watched } from "@engine/device";
import { useEffect, useState } from "react";
import { device } from "@/lib/providers/device";

export function useDevice (): Device {

    return device;

}
export function useDeviceFact<K extends Exclude<keyof Watched, "location"> & keyof Info> ( fact: K ): Info[K] {

    const [value, setValue] = useState<Info[K]>(() => device.info()[fact]);

    useEffect(() => device.watch(fact, ( next ) => setValue(next as unknown as Info[K])), [fact]);

    return value;

}
