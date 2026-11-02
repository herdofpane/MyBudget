/**
 * Validated environment and application configuration.
 * Encapsulates environment variables and runtime configurations.
 */

export interface AppEnvConfig {
  readonly appName: string;
  readonly appVersion: string;
  readonly isDev: boolean;
  readonly apiUrl: string;
  readonly storagePrefix: string;
}

export const ENV: AppEnvConfig = Object.freeze({
  appName: 'Klyro',
  appVersion: '1.0.0',
  isDev: process.env.NODE_ENV !== 'production',
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://api.klyro.local',
  storagePrefix: '@mybudget',
});
