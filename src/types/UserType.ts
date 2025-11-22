
export type GenderType = 'MALE' | 'FEMALE' | 'OTHER'; 
export type UserRoleType = 'USER' | 'MY_SHOP' | 'ADMIN';

export interface UserDto {
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  skills?: string;
  rolesInStartup?: string;
  categoryInvests?: string;
}

export interface ProfileRequest {
  fullName: string;
  phoneNumber?: string;
  gender: GenderType;
  dob: string;
  avatarUrl?: string;
}


export interface forgotPwRequest  {
  email: string;
  password: string;
  otp: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

