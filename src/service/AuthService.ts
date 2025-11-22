import type { AxiosResponse } from 'axios';
import type { LoginResponse } from '../types/AuthType';
import type { ChangePasswordDto, forgotPwRequest, RegisterRequest } from '../types/UserType';
import AxiosService from './AxiosService';

export const AuthService = {
    // Register new user
    register: async (data: RegisterRequest): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.publicPost('/api/Auth/Register', data);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new Error(error.response.data.message || 'Thông tin đăng ký không hợp lệ');
            }
            if (error.response?.status === 409) {
                throw new Error('Email đã được sử dụng');
            }
            throw error;
        }
    },

    // Login
    login: async (email: string, password: string): Promise<AxiosResponse<LoginResponse>> => {
        try {
            const response = await AxiosService.publicPost<LoginResponse>('/api/Auth/Login', {
                email,
                password
            });

            if (response.data.access_token) {
                AxiosService.setAccessToken(response.data.access_token);
            }
            if (response.data.refresh_token) {
                AxiosService.setRefreshToken(response.data.refresh_token);
            }
            if (response.data.expires_in) {
                const expiryTime = Date.now() + response.data.expires_in * 1000;
                localStorage.setItem('tokenExpiry', expiryTime.toString());
            }

            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.message || error.response.data?.title || 'Thông tin đăng nhập không hợp lệ';
                throw new Error(message);
            }
            if (error.response?.status === 401) {
                throw new Error('Email hoặc mật khẩu không đúng');
            }
            if (error.response?.status === 403) {
                throw new Error('Tài khoản chưa được xác thực email');
            }
            throw error;
        }
    },

    // Logout
    logout: async (): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.post('/api/Auth/Logout');
            AxiosService.clearTokens();
            return response;
        } catch (error) {
            AxiosService.clearTokens();
            throw error;
        }
    },

    // Forgot password
    forgotPassword: async (email: string): Promise<AxiosResponse> => {
        return await AxiosService.publicPost('/api/Auth/ForgotPassword', { email });
    },

    // Reset password with OTP
    resetPassword: async (data: forgotPwRequest): Promise<AxiosResponse> => {
        return await AxiosService.publicPost('/api/Auth/ResetPassword', data);
    },

    // Change password
    changePassword: async (data: ChangePasswordDto): Promise<AxiosResponse> => {
        return await AxiosService.post('/api/Auth/ChangePassword', data);
    },

    // Verify email
    verifyEmail: async (token: string): Promise<AxiosResponse> => {
        return await AxiosService.publicPost('/api/Auth/VerifyEmail', { token });
    },

    // Resend verification email
    resendVerificationEmail: async (email: string): Promise<AxiosResponse> => {
        return await AxiosService.publicPost('/api/Auth/ResendVerificationEmail', { email });
    },

    // Get current user ID from token
    getCurrentUserId: (): string | null => {
        return AxiosService.getUserIdFromToken();
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        return !!AxiosService.getAccessToken();
    },
};

export default AuthService;
