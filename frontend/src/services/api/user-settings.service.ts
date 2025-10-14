import { BaseApiService } from "../core/base-api.service";
import type { UserSettings, UserSettingsUpdate } from "@/types/settings";

/**
 * User settings service for managing user preferences
 */
class UserSettingsService extends BaseApiService {
  /**
   * Get the current user's settings
   */
  async getUserSettings(): Promise<UserSettings> {
    return this.get<UserSettings>("/users/settings");
  }

  /**
   * Update the current user's settings
   */
  async updateUserSettings(
    settings: UserSettingsUpdate
  ): Promise<UserSettings> {
    return this.put<UserSettings>("/users/settings", settings);
  }
}

// Export singleton instance
export const userSettingsService = new UserSettingsService();
