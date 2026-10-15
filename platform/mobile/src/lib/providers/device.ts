import { createDevice, type Device, webAdapter } from "engine/device";

export const device: Device = createDevice(webAdapter());
