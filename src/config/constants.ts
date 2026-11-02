/**
 * Global application constants and configuration thresholds.
 */

export const APP_CONFIG = Object.freeze({
  STORAGE_KEYS: {
    BUDGET_STATE: '@mybudget_state_v1',
    PRIVACY_MODE: '@mybudget_privacy_mode_v1',
    SIMULATION_PRESET: '@mybudget_simulation_preset_v1',
    AUTH_SESSION: '@mybudget_auth_session_v1',
  },
  ANIMATION: {
    SPRING_DAMPING: 20,
    SPRING_STIFFNESS: 180,
  },
  LAYOUT: {
    MAX_CONTAINER_WIDTH: 960,
    TOUCH_TARGET_MIN_SIZE: 44,
  },
});
