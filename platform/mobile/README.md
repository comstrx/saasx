# Mobile

A spec-driven Expo / React Native engine (→ MobileX) over `engine/bun`, speaking the same language as the web engine: screens → blocks → features, manifests with options, ports, signals and access, the same bindings (`read`, `write`, `data`, `site`, `live`, `param`, `query`, `signal`) and the same compiler rules (states contract, permissions on write ports, icon set, translations in every language).

## What differs

- Every feature is client-owned; a screen carries `presentation: stack | modal | tab`, `tabs`, `header`, `order`.
- Shell parts are `header`, `tabs` (a tab bar derived from the screens that opt in with `options.tabs: true`) and `loader`.
- Storage is a platform door: AsyncStorage for ports and the outbox, SecureStore for the session (`lib/providers/secure.native.ts`).
- The device adapter (`lib/providers/device.native.ts`) doors expo-location, expo-image-picker, expo-notifications and expo-localization behind the engine's Device DSL.
- Preferences (language, currency, theme) live in a persisted store; the first language is negotiated from the device locales.
- Failures are spoken through the same `errors` dictionaries; undeliverable writes wait in the outbox and replay when the device is online again.

## Gates

```text
bun run check       biome · architecture · messages · specs
bun run typecheck   app and tools projects
bun run bench       spec compile and message composition
bun test            compiler rules · Expo-bundled versions
bun run export      the Android JavaScript bundle of the selected spec
```

## Lab builds

`EXPO_PUBLIC_SPEC=<spec> bun tools/compile/index.ts production`, then `APP_LAB=1 NODE_ENV=production bunx expo prebuild --platform android --clean --no-install` and `./gradlew assembleRelease` in `android/`. With a `google-services.json` beside `app.config.ts`, the lab build takes that project's package name so push tokens can be proven on a device.

Android's cleartext permission follows the spec: `contracts.options.insecure` in the compiled meta becomes `usesCleartextTraffic`, so a production spec with `https` URLs builds without it.

## Release weight

Metro bundles whatever a module reaches, so the app imports one file per icon (`lucide-react-native/icons/<name>`) and `metro.config.cjs` resolves zod's locale table and JSON Schema writers to nothing: the Android bytecode bundle went from 6.3 MB to 3.9 MB. Release builds run R8 with resource shrinking and keep the bundle uncompressed for a faster start (`expo-build-properties` in `app.config.ts`). Measure with `bun run export` (bundle size) and `bun run perf` (cold start, jank).

## Device gates

With a lab build installed and a phone over `adb`, Maestro flows under `flows/` drive the real app and `perf` measures what a user feels:

```text
ADMIN_EMAIL=… ADMIN_PASSWORD=… OTP=… bun run flow login   # credentials, code, then LANDING (a test id, default dashboard-table)
ROW_TEXT="…" bun run flow row                                   # a row by its text, e.g. after a broadcast
bun run perf                                                    # cold start to first frame ≤ COLD_MS (1500), janky frames while scrolling ≤ JANK_PERCENT (1)
bun run compare                                                 # the same two numbers for this app and the phone's own apps (COMPARE=pkg,pkg…), one method for all
```

`MAESTRO` names the Maestro binary when it is not on the path; `APP_ID` names the installed package.
