# Mobile

A spec-driven Expo / React Native engine (→ MobileX) over `engine/bun`, speaking the same language as the web engine: screens → blocks → features, manifests with options, ports, signals and access, the same bindings (`read`, `write`, `data`, `site`, `live`, `param`, `query`, `signal`) and the same compiler rules (states contract, permissions on write ports, icon set, translations in every language).

## What differs

- Every feature is client-owned; a screen carries `presentation: stack | modal | tab`, `tabs`, `header`, `order` and `scroll` (`false` hands the scrolling to a feature that owns a virtualized list, with a `height: "screen"` block filling the frame).
- Navigation needs no router package: the engine's `@engine/history` keeps the stack as data (push, replace, navigate, back, leave guards, native dismissal), `render/navigator.tsx` draws it as a native stack on `react-native-screens`, and the hardware back button and deep links (`settings.app.scheme`) feed it. A tab press is `history.tab`: the root swaps in place under the same native screen, and every tab already opened stays mounted and laid out off screen (`elements/panes.tsx`), so switching back neither remounts, refetches nor relayouts; `<Activity>` was measured slower, its `display: none` relayouts and re-records the whole screen on every reveal.
- The React Compiler is on (`experiments.reactCompiler`). Every hook the engine hands out is named `use<Name>`; a hook named plain `use` is read by the compiler as React's `use()` and memoized away, which once emptied the release login form.
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

Metro bundles whatever a module reaches and does not tree-shake, so weight is decided by what the app imports:

- No router, animation or SVG runtime: the native stack is `react-native-screens` alone, icons and state illustrations are glyphs of a font the compile subsets from the lucide set to exactly the icons the engine names (`fonts/lucide.ttf`, embedded by `expo-font` at build time), and images use React Native's own `Image` (Fresco).
- Emoji, flags and their names come from `@engine/world`: every 3D still (256 px WebP, about 11 MB) and every flag (WebP) is bundled into the app through `@spec/emoji` and `@spec/flags`, so the picker works offline; an image that fails to load falls back to the system glyph.
- Text is set in the world's fonts, Readex Pro for Arabic and Figtree otherwise: the compile pins each variable font to static 400, 600 and 700 weights (`fonts/<family>-<weight>.ttf`, about 22 KB each) that `expo-font` registers as Android font families, so `fontWeight` picks a real weight; Latin inside Arabic text falls back to the system face.
- `metro.config.cjs` resolves zod's locale table, compiler and JSON Schema writers to nothing.
- Release builds run R8 with resource shrinking and keep the bundle uncompressed for a faster start (`expo-build-properties` in `app.config.ts`).
- Every native component carries a static view config (React Native core, react-native-screens, safe-area, Expo views), so `MainApplication` turns React Native's native view config interop off (`nativeFlags` in `app.config.ts`, which also turns on React Native's prepared text layout, Android text measurement optimizations, the optimized view registry and differentiator preallocation; view culling and view recycling crash the ScrollView state on 0.86 and stay off): start-up no longer reflects over every registered view manager on the JavaScript thread. A dependency that still calls `requireNativeComponent` fails loudly on first render.
- Metro's `inlineRequires` defers every module's evaluation to its first use (the emoji catalog costs nothing until the emoji screen opens), and the Android theme draws no window background (`bareWindow` in `app.config.ts`): the app's own frame is the only full-screen layer.

Measure with `bun run export` (bundle size) and `bun run perf` (cold start, jank).

## Device gates

With a lab build installed and a phone over `adb`, Maestro flows under `flows/` drive the real app and `perf` measures what a user feels:

```text
ADMIN_EMAIL=… ADMIN_PASSWORD=… OTP=… bun run flow login   # credentials, code, then LANDING (a test id, default dashboard-table)
ROW_TEXT="…" bun run flow row                                   # a row by its text, e.g. after a broadcast
bun run perf                                                    # cold start to first frame ≤ COLD_MS (1500), janky frames while scrolling ≤ JANK_PERCENT (1)
bun run compare                                                 # the same two numbers for this app and the phone's own apps (COMPARE=pkg,pkg…), one method for all
```

`MAESTRO` names the Maestro binary when it is not on the path; `APP_ID` names the installed package.
