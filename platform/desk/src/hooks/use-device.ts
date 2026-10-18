import { bindDevice } from "engine/client";
import { device } from "@/lib/providers/device";

export const { useDevice, useDeviceFact } = bindDevice(device);
