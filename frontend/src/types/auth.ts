export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  tier: 'free' | 'pro' | 'ai_power' | 'enterprise';
  mfa_enabled: boolean;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  status: string;
  user: User;
  tokens: AuthTokens;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}
