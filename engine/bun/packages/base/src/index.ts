export { identifier, trace, uuid } from "./identity.ts";
export {
    type Compact,
    choose,
    compact,
    type Dictionary,
    deepMerge,
    includes,
    isRecord,
    isScalar,
    keysOf,
    kindOf,
    mapValues,
    pathGet,
    pathSet,
    safeKey,
} from "./object.ts";
export { anySignal, base64, clone, now, randomBytes, sleep, timeoutSignal } from "./platform.ts";
