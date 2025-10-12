// User types
export interface UserCreate {
  username: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserRead {
  id: number;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// User Settings types
export interface UserSettings {
  id: number;
  user_id: number;
  auto_reload_enabled: boolean;
  auto_reload_interval_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsUpdate {
  auto_reload_enabled?: boolean;
  auto_reload_interval_minutes?: number;
}
