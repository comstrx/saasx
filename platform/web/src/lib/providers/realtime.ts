import type Pusher from "pusher-js";

export type { Channel } from "pusher-js";
export type Options = ConstructorParameters<typeof Pusher>[1];
export { default } from "pusher-js";
