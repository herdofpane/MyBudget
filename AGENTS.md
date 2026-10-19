# Klyro Project Guidelines (Expo / React Native)

Universal personal budget management application built with Expo and React Native.

---

## 1. Expo & React Native Best Practices

### Expo Versioning & Documentation
Expo evolves quickly across SDK releases. Before writing or modifying any code interacting with Expo, EAS, or React Native APIs:
1. Check the major version of the `expo` package in `package.json`.
2. Consult the versioned documentation: `https://docs.expo.dev/versions/v<major>.0.0/`
3. Refer to `https://docs.expo.dev/llms.txt` for official recommendations and corrections to common LLM misconceptions.

### Standard Commands
Use `bunx` instead of `npx` if the project uses Bun (`bun.lock` present).
```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/bun add (resolves SDK-compatible versions)
npx expo start              # Start the development server
npx expo lint               # Run linter
npx tsc --noEmit            # Run TypeScript type check
npx expo-doctor             # Diagnose dependency and configuration issues
npx expo install --fix      # Fix incompatible package versions
```
Always run `lint` and `tsc --noEmit` before declaring any task complete.

### Navigation & Routing (Expo Router)
- **Expo Router** handles all navigation.
- Application routes reside exclusively in `src/app/` (each file is a screen, `_layout.tsx` files define navigators).
- Non-route code (components, hooks, utilities, services) must strictly remain outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.

### EAS Build & Updates
- Use EAS for cloud builds, signing, and store deployments (`eas build`, `eas submit`) as well as over-the-air updates (`eas update`).
- Do not require local installations of Android Studio or Xcode.
- Run the EAS CLI via `npx eas-cli@latest <command>` (or `bunx eas-cli <command>`).

### Native Code & Continuous Native Generation (CNG)
- The `ios/` and `android/` directories are generated automatically: never create or edit them manually. Native configuration is managed via `app.json` and config plugins.
- Favor officially recommended Expo modules before introducing third-party libraries.

---

## 2. Architecture & Mobile Performance (Klyro)

### Application Layer Separation
- **Pure UI Components (`src/components/`)**: Screen and UI components focus strictly on visual rendering without heavy business logic or direct persistence calls.
- **Systematic Delegation to Custom Hooks (`src/hooks/`)**: Extract state logic, reactive computations, and asynchronous interactions into dedicated hooks (`useHomeSummary`, `useFixedExpenses`, `useVariableExpenses`, `useDetailsSimulation`).
- **Pure Financial Computations & Utilities (`src/utils/`, `src/constants/`)**: Offload all mathematical rules (savings formula, available spending calculations, multi-month smoothing, semantic icon/category matching) into pure, testable functions.
- **Local Data Access (`src/services/`)**: The application operates 100% offline; all persistence operations must go through the dedicated `AsyncStorage` service (`budget-storage.service.ts`), ensuring complete decoupling from the presentation layer.

### Runtime Performance & React Native Render Cycles
- **Targeted Memoization**: Memoize heavy budget aggregation computations (`useMemo`) and stabilize function references passed as props (`useCallback`).
- **List Virtualization**: Use virtualized lists (`FlatList` or `FlashList`) with stable and unique `keyExtractor` props whenever displaying dynamic volumes of items (expense schedules, transaction lists, breakdowns).

---

## 3. Continuous Maintenance & Automatic Documentation Updates (README.md)

The `README.md` file is the living reference document of the project. It must accurately reflect the real state of the application at all times:
1. **Proactive and Systematic Updates**:
   - Any task or change introducing functional updates (new screen, key component, calculation rule), structural changes (folder/file structure), technical evolutions (Expo/React Native versions, key dependencies), or operational changes (new scripts, utilities, configuration) must **automatically and without waiting for explicit user prompts** trigger an update to `README.md`.
2. **Strict Section Synchronization in README**:
   - **Badges and Versions**: Keep key versions up to date (Expo SDK, React Native, React, TypeScript, etc.).
   - **Core Features**: Faithfully document any new feature or altered behavior with clarity and domain precision.
   - **Project Tree**: Update the directory/file structure diagram whenever significant files or folders are added, renamed, or deleted.
   - **Commands and Scripts**: Document any new `npm` scripts or utilities added to the project.
3. **Quality Standards and Tone**:
   - Maintain a sleek, structured, and professional tone aligned with modern fintech and neobank standards.
   - Preserve readability (careful Markdown formatting, clean bullet points, no superfluous emojis, explicit mathematical formulas).
4. **Pre-Completion Validation**:
   - Before declaring a task finished or proposing a commit, systematically verify that `README.md` is in complete alignment with the changes made.
