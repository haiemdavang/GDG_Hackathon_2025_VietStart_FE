import type { AxiosResponse } from 'axios';
import type { CreateShareDto, ShareDto, UpdateShareDto } from '../types/ShareType';
import AxiosService from './AxiosService';

export const ShareService = {
    // Get shares by startup ID
    getSharesByStartup: async (startupId: number): Promise<AxiosResponse<ShareDto[]>> => {
        try {
            const response = await AxiosService.get<ShareDto[]>(`/api/Shares/startup/${startupId}`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Startup không tồn tại');
            }
            throw error;
        }
    },

    // Get shares by user ID
    getSharesByUser: async (userId: string): Promise<AxiosResponse<ShareDto[]>> => {
        try {
            const response = await AxiosService.get<ShareDto[]>(`/api/Shares/user/${userId}`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Người dùng không tồn tại');
            }
            throw error;
        }
    },

    // Get current user's shares
    getMyShares: async (): Promise<AxiosResponse<ShareDto[]>> => {
        const userId = AxiosService.getUserIdFromToken();
        if (!userId) {
            throw new Error('Người dùng chưa đăng nhập');
        }
        return await ShareService.getSharesByUser(userId);
    },

    // Create a new share
    createShare: async (data: CreateShareDto): Promise<AxiosResponse<ShareDto>> => {
        try {
            const response = await AxiosService.post<ShareDto>('/api/Shares', data);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Thông tin chia sẻ không hợp lệ';
                throw new Error(message);
            }
            throw error;
        }
    },

    // Update a share
    updateShare: async (
        userId: string,
        startupId: number,
        data: UpdateShareDto
    ): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.post(`/api/Shares/${userId}/${startupId}/update`, data);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Thông tin cập nhật không hợp lệ';
                throw new Error(message);
            }
            if (error.response?.status === 403) {
                throw new Error('Bạn không có quyền chỉnh sửa chia sẻ này');
            }
            if (error.response?.status === 404) {
                throw new Error('Chia sẻ không tồn tại');
            }
            throw error;
        }
    },

    // Update current user's share
    updateMyShare: async (
        startupId: number,
        data: UpdateShareDto
    ): Promise<AxiosResponse> => {
        const userId = AxiosService.getUserIdFromToken();
        if (!userId) {
            throw new Error('Người dùng chưa đăng nhập');
        }
        return await ShareService.updateShare(userId, startupId, data);
    },

    // Delete a share
    deleteShare: async (userId: string, startupId: number): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.post(`/api/Shares/${userId}/${startupId}/delete`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error('Bạn không có quyền xóa chia sẻ này');
            }
            if (error.response?.status === 404) {
                throw new Error('Chia sẻ không tồn tại');
            }
            throw error;
        }
    },

    // Delete current user's share
    deleteMyShare: async (startupId: number): Promise<AxiosResponse> => {
        const userId = AxiosService.getUserIdFromToken();
        if (!userId) {
            throw new Error('Người dùng chưa đăng nhập');
        }
        return await ShareService.deleteShare(userId, startupId);
    },
};

export default ShareService;
