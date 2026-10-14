"use client";

import { bindDevice } from "@engine/context";
import { device } from "@/lib/providers/device";

export const { useDevice, useDeviceFact } = bindDevice(device);
