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
bun test            compiler rules · Expo-bundled versions
bun run export      the Android JavaScript bundle of the selected spec
```

## Lab builds

`EXPO_PUBLIC_SPEC=<spec> bun tools/compile/index.ts production`, then `APP_LAB=1 NODE_ENV=production bunx expo prebuild --platform android --clean --no-install` and `./gradlew assembleRelease` in `android/`. With a `google-services.json` beside `app.config.ts`, the lab build takes that project's package name so push tokens can be proven on a device.
