import type { AxiosResponse } from 'axios';
import type { ProfileData } from '../types/ProfileType';
import type { ProfileRequest } from '../types/UserType';
import AxiosService from './AxiosService';

export const UserService = {
    // Get user profile by ID
    getUserProfile: async (userId: string): Promise<AxiosResponse<ProfileData>> => {
        try {
            const response = await AxiosService.get<ProfileData>(`/api/Users/${userId}`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Không tìm thấy người dùng');
            }
            throw error;
        }
    },

    // Get current user profile
    getCurrentUserProfile: async (): Promise<AxiosResponse<ProfileData>> => {
        const userId = AxiosService.getUserIdFromToken();
        if (!userId) {
            throw new Error('Người dùng chưa đăng nhập');
        }
        return await UserService.getUserProfile(userId);
    },

    // Update user profile
    updateUserProfile: async (userId: string, data: ProfileRequest): Promise<AxiosResponse<ProfileData>> => {
        try {
            const response = await AxiosService.put<ProfileData>(`/api/Users/${userId}`, data);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new Error('Thông tin cập nhật không hợp lệ');
            }
            throw error;
        }
    },

    // Update current user profile
    updateCurrentUserProfile: async (data: ProfileRequest): Promise<AxiosResponse<ProfileData>> => {
        const userId = AxiosService.getUserIdFromToken();
        if (!userId) {
            throw new Error('Người dùng chưa đăng nhập');
        }
        return await UserService.updateUserProfile(userId, data);
    },

    // Upload avatar
    uploadAvatar: async (file: File): Promise<AxiosResponse<{ avatarUrl: string }>> => {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await AxiosService.post<{ avatarUrl: string }>(
                '/api/User/UploadAvatar',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new Error('File không hợp lệ');
            }
            throw error;
        }
    },

    // Delete user account
    deleteUserAccount: async (userId: string): Promise<AxiosResponse> => {
        return await AxiosService.delete(`/api/User/${userId}`);
    },

    // Get user statistics
    getUserStatistics: async (userId: string): Promise<AxiosResponse<any>> => {
        return await AxiosService.get(`/api/User/${userId}/statistics`);
    },
};

export default UserService;
