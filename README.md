# bg·location starter

A small, runnable [Expo](https://expo.dev) / React Native app that demonstrates
[`@aalillou/mo-bg-location`](https://www.npmjs.com/package/@aalillou/mo-bg-location)
— background location tracking that sips battery, wakes itself without GPS, and
keeps recording after the app is killed.

**Clone it, run it on your own phone, and watch it work.** Everything stays on
the device — no account, no backend, no telemetry.

> This is a *demo/starter*, not a production template. It runs in **development
> mode**, so it needs **no license key**. Its job is to show the SDK working on
> real hardware and to be a readable reference for wiring it into your own app.

---

## What it does

- A full-screen map with your live position and a growing **breadcrumb trail**.
- A motion chip driven by the SDK's on-device classifier — **in vehicle / on
  foot / resting**.
- A battery readout showing how little the trip costs.
- **Survives being swiped away:** kill the app mid-trip, reopen it, and the trail
  has kept growing.
- A **trip summary** at the end — distance, duration, battery used, accuracy, and
  the driving / walking / still split.

---

## Requirements

You need the standard React Native (bare-workflow) toolchain — this app builds a
native binary, so Expo Go is not enough.

- **A physical device.** The whole point is real GPS, motion, and battery; a
  simulator/emulator won't demonstrate anything. Every run below uses `--device`.
- **Node** — a current LTS (20 or newer) and `npm`.
- **Android:** [Android Studio](https://developer.android.com/studio) (or the
  Android SDK + platform tools), and a device with **Developer options →
  USB debugging** enabled, plugged in over USB.
- **iOS (macOS only):** **Xcode** + command-line tools + CocoaPods, and a **free
  Apple Developer account** (a personal team is enough to sign a dev build onto
  your own device — no paid membership needed).

Built and tested on **Expo SDK 56 / React Native 0.85** with the New Architecture
enabled.

---

## Quick start

```bash
git clone https://github.com/aalillou/mo-bg-location-starter
cd mo-bg-location-starter
npm install
```

Then build onto a connected device:

```bash
# Android (device in USB-debugging mode, plugged in)
npm run android      # → expo run:android --device

# iOS (on a Mac, device plugged in and trusted)
npm run ios          # → expo run:ios --device
```

There is **no separate build step**. `expo run:*` automatically runs
`expo prebuild` — it generates the native `ios/` and `android/` projects and wires
the config plugins (permissions, purpose strings, MapLibre, static frameworks) —
then compiles and installs onto the device. **The first build is slow** (it's a
full native compile); subsequent runs are fast.

Once it launches:

1. Grant the permission ladder when prompted (see [Permissions](#permissions)).
2. Press the play button to start a trip.
3. Walk or drive. Watch the trail draw itself.
4. **Swipe the app away and reopen it** — the trail kept growing while it was gone.
5. Press stop to see the trip summary.

---

## How it's wired

Minimal integration is just: **`configure(config)` → `requestPermissions(...)` →
`start()`**, then subscribe to `onLocation`. Everything else in `src/` is demo UI.
The parts worth reading:

| File | What it shows |
| --- | --- |
| [`src/sdkConfig.ts`](src/sdkConfig.ts) | The SDK `Config` — accuracy, `stopTimeout`, `labelMode`, `powerMode`, `wakeOnTerminate`, and `nativeSync: false` (nothing leaves the phone). Plus the map tile style. |
| [`src/hooks/useTracking.ts`](src/hooks/useTracking.ts) | The SDK lifecycle: `configure()` → subscribe to `onLocation` / `onMotionChange` → `start()` / `stop()`, and the cold-start resolver that restores a live session (the swipe-away demo). |
| [`src/hooks/usePermissionFlow.ts`](src/hooks/usePermissionFlow.ts) | The one-shot permission ladder — `requestPermissions({ background: true, activity: true })` — with a Settings fallback when the OS won't re-prompt. |
| [`App.tsx`](App.tsx) | The phase host: `boot → permission → live → summary / idle`. |
| [`app.json`](app.json) | The Expo config plugins and the SDK purpose strings. |

The **full configuration and API reference** lives in the SDK package's own
README (`node_modules/@aalillou/mo-bg-location/README.md`, or on
[npm](https://www.npmjs.com/package/@aalillou/mo-bg-location)).

---

## Permissions

The app requests everything in one tap and handles the rest for you. What the OS
asks the user:

- **iOS** — Location **"Always"** (asked in two steps: *While Using* first, then
  *Always*, as Apple requires) and **Motion & Fitness**. The purpose strings are
  in [`app.json`](app.json).
- **Android** — Location **"Allow all the time"** (the system dialog only grants
  *While in use*; the app then sends you to Settings to switch it to *Always*),
  **Physical activity**, and **Notifications** (Android 13+, for the
  foreground-service tracking notification).

For **reliable background tracking**, exempt the app from **battery
optimization** — some Android OEMs kill backgrounded apps aggressively. On a
whitelisted device the SDK's silent drive-away detection is also more precise
(it can use exact alarms).

---

## Troubleshooting

- **"It builds but nothing happens / no trail."** You're probably on a
  simulator. This needs a **real device** — rerun with `npm run android` /
  `npm run ios` (both pass `--device`).

- **iOS build fails on Firebase / modular headers.** The SDK links Firebase,
  which needs CocoaPods to build frameworks statically. This repo already sets
  `useFrameworks: "static"` via `expo-build-properties` in
  [`app.json`](app.json) — keep it if you copy the integration elsewhere.

- **iOS build fails writing `ip.txt` / "Sandbox: ... deny".** Newer Xcode (26+)
  turns **User Script Sandboxing** on by default, which blocks React Native's
  bundle phase. This repo pins it off with
  [`plugins/withUserScriptSandboxingOff.js`](plugins/withUserScriptSandboxingOff.js).

- **iOS asks to "find devices on your local network" on first launch.** That's
  the Expo **dev client** discovering the Metro bundler — allow it. It's a
  development-only prompt and unrelated to tracking.

- **The map is blank but tracking still works.** Map tiles come from a
  third-party host ([OpenFreeMap](https://openfreemap.org)); with no network the
  backdrop disappears but fixes keep recording. The SDK itself sends nothing.

- **A dev build shows a white screen offline / in airplane mode.** A development
  build fetches its JavaScript from Metro; with no network that fails. Keep the
  packager running, or make a **release build** (which embeds the JS bundle) to
  test true offline.

- **Changed `app.json`, an icon, or a plugin and don't see it.** `expo run:*`
  only prebuilds when `ios/` / `android/` are missing. Force a re-apply with
  `npx expo prebuild -p android` (or `ios`) before rebuilding.

- **Android "bg·location starter keeps stopping".** Fixed in the SDK at
  **≥ 0.1.4** (an exact-alarm guard); this starter pins `0.1.4`. If you bump the
  SDK, stay on `0.1.4` or newer.

---

## License

The starter **app source in this repository is MIT** (see [`LICENSE`](LICENSE)).

The `@aalillou/mo-bg-location` **SDK it demonstrates is proprietary**, licensed
separately — **free in development/debug**, with a license key required for
release builds. See the LICENSE inside that npm package.
