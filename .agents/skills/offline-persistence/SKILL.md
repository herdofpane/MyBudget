---
name: offline-persistence
description: >-
  100% offline data resilience, AsyncStorage architecture, schema integrity, and atomic storage operations for Klyro.
  Use when reading, writing, migrating, or structuring persisted budget data in budget-storage.service.ts.
---

# Offline Persistence & Data Resilience (Klyro)

Data architecture, resilience rules, and offline persistence protocols for Klyro.

---

## 1. 100% Offline-First Paradigm

* **Complete Independence**:
  * The application operates strictly offline. No remote database or cloud authentication is required.
  * Zero financial telemetry or personal transaction data leaves the device.
* **Single Gateway Service**:
  * All access to storage must transit through `src/services/budget-storage.service.ts`.
  * Direct invocation of `@react-native-async-storage/async-storage` outside this service is strictly forbidden.

---

## 2. Schema Integrity & Migrations

* **Schema Versioning**:
  * Maintain a versioned storage key (`klyro_budget_data_v1`, etc.) or internal schema version identifier.
  * Validate payload structures when reading from storage before casting to TypeScript types.
* **Graceful Fallbacks & Default States**:
  * When storage is empty or corrupted, fall back deterministically to safe default objects (e.g. initial empty expense arrays, zero income).
  * Never let a JSON parse error or null pointer bubble up and crash the application.
* **Atomic Mutations**:
  * Ensure updates to the budget state are written atomically.
  * In-memory state and persisted state must be kept strictly synchronized via the global context / custom hooks.

---

## 3. Data Sanitization & Defensive Serialization

* **Financial Number Hygiene**:
  * Sanitize inputs before serializing: strip trailing commas, parse floats cleanly, guard against `NaN` and `Infinity`.
  * Ensure IDs are unique (e.g., using timestamp + random suffix or UUID).
* **Export & Backup Integrity**:
  * When exporting or importing user budget states (JSON dumps), validate against a strict schema schema before importing.
