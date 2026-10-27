---
name: expo-react-native
description: >-
  Expo SDK 57, React Native 0.86, Expo Router navigation, CNG, and EAS workflows for Klyro.
  Use when modifying routes, Expo configuration, native modules, dependencies, or running development/build commands.
---

# Expo & React Native Best Practices (Klyro)

Comprehensive development workflow, versioning rules, and command conventions for Expo SDK 57 and React Native.

---

## 1. Versioning & Documentation Rules

Expo evolves quickly across SDK releases. Before writing or modifying any code interacting with Expo, EAS, or React Native APIs:
1. Check the major version of `expo` in `package.json` (currently **SDK 57**).
2. Consult the versioned documentation: `https://docs.expo.dev/versions/v57.0.0/`
3. Consult `https://docs.expo.dev/llms.txt` for official recommendations and corrections to common LLM misconceptions.

---

## 2. Standard Commands

Use `bunx` instead of `npx` if the project uses Bun (`bun.lock` present). Otherwise, use standard `npx`:

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/bun add (resolves SDK-compatible versions)
npx expo start              # Start the development server
npx expo lint               # Run linter
npx tsc --noEmit            # Run TypeScript type check
npx expo-doctor             # Diagnose dependency and configuration issues
npx expo install --fix      # Fix incompatible package versions
```

> [!IMPORTANT]
> Always run `lint` and `tsc --noEmit` before declaring any task complete.

---

## 3. Navigation & Routing (Expo Router)

* **Directory Isolation**: Application routes reside exclusively in `src/app/`. Each file is a screen, and `_layout.tsx` files define navigators.
* **Separation of Concerns**: Non-route code (components, hooks, utilities, services) must strictly remain outside `src/app/`.
* **Standard Imports**: Import `Link`, `router`, and `useLocalSearchParams` exclusively from `expo-router`.
* **Deep Linking**: Preserve typed paths matching the file tree.

---

## 4. Continuous Native Generation (CNG) & Native Code

* **Immutable Native Directories**: The `ios/` and `android/` directories are generated automatically: never create or edit them manually.
* **Configuration via Plugins**: Native configuration is managed via `app.json` and Expo config plugins.
* **Module Selection**: Favor officially recommended Expo modules (`expo-*`) before introducing third-party React Native libraries.

---

## 5. EAS Build & Updates

* Use EAS for cloud builds, signing, and store deployments (`eas build`, `eas submit`) as well as over-the-air updates (`eas update`).
* Do not require local installations of Android Studio or Xcode.
* Run the EAS CLI via `npx eas-cli@latest <command>` (or `bunx eas-cli <command>`).
