/**
 * User settings related types
 */

/**
 * User settings data returned from API
 */
export interface UserSettings {
  id: number;
  user_id: number;
  auto_reload_enabled: boolean;
  auto_reload_interval_minutes: number;
  created_at: string;
  updated_at: string;
}

/**
 * User settings update data
 */
export interface UserSettingsUpdate {
  auto_reload_enabled?: boolean;
  auto_reload_interval_minutes?: number;
}
