import { createSignal, createTopics } from "../../lib/std/events.ts";
import { type Feature, touches } from "../features/index.ts";

const sessions = createSignal<string>();
const mutations = createTopics<string>();

export const onSessionRejected = sessions.subscribe;
export const rejectSession = sessions.emit;

export function onMutation ( feature: Feature, receive: () => void ) {

    return mutations.subscribe(feature, receive);

}
export function invalidate ( feature: string ): void {

    mutations.emit(feature, undefined);

    for ( const other of touches[feature as Feature] ?? [] ) {

        mutations.emit(other, undefined);

    }

}
