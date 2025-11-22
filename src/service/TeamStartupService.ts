import type { AxiosResponse } from 'axios';
import type {
    CreateTeamStartUpDto,
    TeamStartUpDetailDto,
    TeamStartUpDto,
    UpdateTeamStartUpDto
} from '../types/StartupPositionType';
import AxiosService from './AxiosService';

interface PaginatedTeamStartUpsResponse {
    data: TeamStartUpDto[];
    total: number;
}

export const TeamStartupService = {
    // Get paginated team startups with filters
    getTeamStartUps: async (
        startUpId?: number,
        userId?: string,
        status?: string,
        page: number = 1,
        pageSize: number = 10
    ): Promise<AxiosResponse<PaginatedTeamStartUpsResponse>> => {
        try {
            const params = new URLSearchParams();
            if (startUpId) params.append('startUpId', startUpId.toString());
            if (userId) params.append('userId', userId);
            if (status) params.append('status', status);
            params.append('page', page.toString());
            params.append('pageSize', pageSize.toString());

            const response = await AxiosService.get<PaginatedTeamStartUpsResponse>(
                `/api/TeamStartUps?${params.toString()}`
            );
            return response;
        } catch (error: any) {
            throw error;
        }
    },

    // Get team startup by ID with details
    getTeamStartUpById: async (id: number): Promise<AxiosResponse<TeamStartUpDetailDto>> => {
        try {
            const response = await AxiosService.get<TeamStartUpDetailDto>(`/api/TeamStartUps/${id}`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Thành viên team không tồn tại');
            }
            throw error;
        }
    },

    // Get team members by startup ID
    getTeamStartUpsByStartUp: async (startUpId: number): Promise<AxiosResponse<TeamStartUpDto[]>> => {
        try {
            const response = await AxiosService.get<TeamStartUpDto[]>(`/api/TeamStartUps/startup/${startUpId}`);
            return response;
        } catch (error: any) {
            throw error;
        }
    },

    // Get team startups by user ID
    getTeamStartUpsByUser: async (userId: string): Promise<AxiosResponse<TeamStartUpDto[]>> => {
        try {
            const response = await AxiosService.get<TeamStartUpDto[]>(`/api/TeamStartUps/user/${userId}`);
            return response;
        } catch (error: any) {
            throw error;
        }
    },

    // Get current user's team startups
    getMyTeamStartUps: async (): Promise<AxiosResponse<TeamStartUpDto[]>> => {
        const userId = AxiosService.getUserIdFromToken();
        if (!userId) {
            throw new Error('Người dùng chưa đăng nhập');
        }
        return await TeamStartupService.getTeamStartUpsByUser(userId);
    },

    // Get team startups by status (Admin only)
    getTeamStartUpsByStatus: async (status: string): Promise<AxiosResponse<TeamStartUpDto[]>> => {
        try {
            const response = await AxiosService.get<TeamStartUpDto[]>(`/api/TeamStartUps/status/${status}`);
            return response;
        } catch (error: any) {
            throw error;
        }
    },

    // Create new team member / Apply to startup
    createTeamStartUp: async (data: CreateTeamStartUpDto): Promise<AxiosResponse<TeamStartUpDto>> => {
        try {
            const response = await AxiosService.post<TeamStartUpDto>('/api/TeamStartUps', data);
            return response;
        } catch (error: any) {
            console.log(error);
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Thông tin không hợp lệ';
                throw new Error(message);
            }
            throw error;
        }
    },

    // Update team startup
    updateTeamStartUp: async (id: number, data: UpdateTeamStartUpDto): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.put(`/api/TeamStartUps/${id}`, data);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Thông tin cập nhật không hợp lệ';
                throw new Error(message);
            }
            if (error.response?.status === 403) {
                throw new Error('Bạn không có quyền chỉnh sửa thành viên team này');
            }
            if (error.response?.status === 404) {
                throw new Error('Thành viên team không tồn tại');
            }
            throw error;
        }
    },

    // Delete team startup
    deleteTeamStartUp: async (id: number): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.delete(`/api/TeamStartUps/${id}`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error('Bạn không có quyền xóa thành viên team này');
            }
            if (error.response?.status === 404) {
                throw new Error('Thành viên team không tồn tại');
            }
            throw error;
        }
    },

    // Update team startup status (Approve/Reject application)
    updateTeamStartUpStatus: async (id: number, status: string): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.put(`/api/TeamStartUps/${id}/status`, JSON.stringify(status), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error('Chỉ chủ startup mới có quyền cập nhật trạng thái');
            }
            if (error.response?.status === 404) {
                throw new Error('Thành viên team không tồn tại');
            }
            throw error;
        }
    },
};

export default TeamStartupService;
