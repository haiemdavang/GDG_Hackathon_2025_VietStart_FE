import type { UserRoleType } from "../types/UserType";

export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || 'http://localhost:4141/api'
export const BASE_BE_URL = import.meta.env.VITE_BASE_BE_URL || 'http://localhost:4141'
export const MAX_IMAGE_SIZE = import.meta.env.VITE_MAX_IMAGE_SIZE
export const BASE_FE_URL = import.meta.env.VITE_BASE_FE_URL
export const GOOGLE_LOGIN_URL = `${BASE_BE_URL}/oauth2/authorize/google`
export const CLOUNDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
export const CLOUNDINARY_NAME = import.meta.env.VITE_CLOUDINARY_NAME



export type TypeMode = 'myshop' | 'admin' | 'user';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    FORGOT_PASSWORD: '/forgot-password',
    REFRESH: '/auth/refresh-token',
    SWITCH_TOKEN_TYPE: (type: UserRoleType) => `/auth/switch-token-type?type=${type}`,
    HISTORY_LOGIN: '/history-login',
  },
  OTP: {
    GET_OTP: '/otp/sendOtp',
    VERIFY_OTP: '/otp/verifyOTP',
  },
  USERS: {
    ME: '/user/me',
    REGISTER: '/user/register',
    PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    RESET_PASSWORD: '/user/reset-password',
    UPDATE_PROFILE: '/user/update-profile',
    VERIFY_EMAIL: '/user/verify-email',
  },
  ADMIN: {
  },
};



export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  LOGIN_REDIRECT: (redirectPath: string) => `/login?redirect=${redirectPath}`,
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  PROFILE: (userId: string) => `/profile/${userId}`,
  EDIT_PROFILE: '/profile/edit',
  SUGGESTION: '/suggestion',
  MY_POSTS: '/my-posts',
  FIND_MEMBER: '/find-member',
  CHAT_LIST: '/chat',
  CHAT_ROOM: (startupId: number) => `/chat/${startupId}`,

  ADMIN: {
    BASE: '/admin/*',
  },
};

export const APP_ROUTES_PUBLIC = [
  APP_ROUTES.HOME,
  APP_ROUTES.LOGIN,
  APP_ROUTES.REGISTER,
  APP_ROUTES.FORGOT_PASSWORD,
]


// 4. User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const APP_CONFIG = {
  ITEMS_PER_PAGE: 10,
  REQUEST_TIMEOUT: 30000,
};

export const LOCAL_STORAGE_KEYS = {
  ORDER_ITEM_IDS: 'orderItemIds',
};