import type { UserDto } from "./UserType";



export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface OtpRequest {
  code: string;
  email: string;
}

export interface ResetPwRequest {
  email: string;
  password: string;
  otp: string;
}

export interface HistoryLoginDto {
  id: string;
  loginAt: string;
  logoutAt: string;
  userAgent: string;
  location: string;
  device: string;
  currentSession: boolean;
  active: boolean;
}
