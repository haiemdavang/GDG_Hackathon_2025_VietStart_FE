import type { AxiosResponse } from 'axios';
import type {
    CreateStartUpDto,
    GroupedSuggestionsResponse,
    PaginatedStartupsResponse,
    RecalculateEmbeddingsResponse,
    StartUpDetailDto,
    StartUpDto,
    SuggestUsersResponse,
    UpdateStartUpDto,
    UserSuggestionDto
} from '../types/StartupType';
import AxiosService from './AxiosService';

export const StartupService = {
    getStartups: async (
        categoryId?: number,
        page: number = 1,
        pageSize: number = 10
    ): Promise<AxiosResponse<PaginatedStartupsResponse>> => {
        try {
            const params = new URLSearchParams();
            if (categoryId) params.append('categoryId', categoryId.toString());
            params.append('page', page.toString());
            params.append('pageSize', pageSize.toString());

            const response = await AxiosService.get<PaginatedStartupsResponse>(
                `/api/Startups?${params.toString()}`
            );
            return response;
        } catch (error: any) {
            throw error;
        }
    },

    // Get startup by ID
    getStartupById: async (id: number): Promise<AxiosResponse<StartUpDto>> => {
        try {
            const response = await AxiosService.get<StartUpDto>(`/api/Startups/${id}`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Startup không tồn tại');
            }
            throw error;
        }
    },

    // Get startup details with comments and likes
    getStartupDetails: async (id: number): Promise<AxiosResponse<StartUpDetailDto>> => {
        try {
            const response = await AxiosService.get<StartUpDetailDto>(`/api/Startups/${id}/details`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Startup không tồn tại');
            }
            throw error;
        }
    },

    // Create new startup
    createStartup: async (data: CreateStartUpDto): Promise<AxiosResponse<StartUpDto>> => {
        try {
            const response = await AxiosService.post<StartUpDto>('/api/Startups', data);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Thông tin startup không hợp lệ';
                throw new Error(message);
            }
            throw error;
        }
    },

    // Update startup
    updateStartup: async (id: number, data: UpdateStartUpDto): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.put(`/api/Startups/${id}`, data);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Thông tin cập nhật không hợp lệ';
                throw new Error(message);
            }
            if (error.response?.status === 403) {
                throw new Error('Bạn không có quyền chỉnh sửa startup này');
            }
            if (error.response?.status === 404) {
                throw new Error('Startup không tồn tại');
            }
            throw error;
        }
    },

    // Delete startup
    deleteStartup: async (id: number): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.delete(`/api/Startups/${id}`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error('Bạn không có quyền xóa startup này');
            }
            if (error.response?.status === 404) {
                throw new Error('Startup không tồn tại');
            }
            throw error;
        }
    },

    // Get startups by user ID
    getUserStartups: async (userId: string): Promise<AxiosResponse<StartUpDto[]>> => {
        try {
            const response = await AxiosService.get<StartUpDto[]>(`/api/Startups/user/${userId}`);
            return response;
        } catch (error: any) {
            throw error;
        }
    },

    // Get current user's startups
    getMyStartups: async (): Promise<AxiosResponse<StartUpDto[]>> => {
        const userId = AxiosService.getUserIdFromToken();
        if (!userId) {
            throw new Error('Người dùng chưa đăng nhập');
        }
        return await StartupService.getUserStartups(userId);
    },

    // Get suggested users for startup
    getSuggestedUsers: async (startupId: number): Promise<AxiosResponse<SuggestUsersResponse>> => {
        try {
            const response = await AxiosService.get<SuggestUsersResponse>(
                `/api/Startups/${startupId}/suggest-users`
            );
            return response;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Startup không tồn tại');
            }
            throw error;
        }
    },

    // Recalculate startup embeddings
    recalculateEmbeddings: async (startupId: number): Promise<AxiosResponse<RecalculateEmbeddingsResponse>> => {
        try {
            const response = await AxiosService.post<RecalculateEmbeddingsResponse>(
                `/api/Startups/${startupId}/recalculate-embeddings`
            );
            return response;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Startup không tồn tại');
            }
            if (error.response?.status === 500) {
                const message = error.response.data?.Message || 'Lỗi khi tính toán embeddings';
                throw new Error(message);
            }
            throw error;
        }
    },

    // Get grouped suggested users for startup
    getSuggestedUsersGrouped: async (startupId: number): Promise<AxiosResponse<GroupedSuggestionsResponse>> => {
        try {
            const response = await AxiosService.get<GroupedSuggestionsResponse>(
                `/api/Startups/${startupId}/suggest-users-grouped`
            );
            return response;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Startup không tồn tại');
            }
            throw error;
        }
    },
};

export default StartupService;
