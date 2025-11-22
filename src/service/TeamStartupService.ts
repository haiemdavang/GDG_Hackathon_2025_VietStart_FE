import type { AxiosResponse } from 'axios';
import type {
    CreateTeamStartUpDto,
    TeamStartUpDetailDto,
    TeamStartUpDto,
    UpdateTeamStartUpDto
} from '../types/StartupPositionType';
import AxiosService from './AxiosService';
import type { CreateTeamStartUpDtoType } from '../types/StartupType';

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
            const response = await AxiosService.post(`/api/TeamStartUps/${id}/update`, data);
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
            const response = await AxiosService.post(`/api/TeamStartUps/${id}/delete`);
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
            const response = await AxiosService.post(`/api/TeamStartUps/${id}/status`, JSON.stringify(status), {
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

    // DEPRECATED: Use sendInvitation instead
    inviteStartUp: async (startUpId: number, userId: string): Promise<AxiosResponse> => {
        try {
            const data: CreateTeamStartUpDtoType = {
                startUpId,
                userId
            };
            
            const response = await AxiosService.post('/api/TeamStartUps/invite', data);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                // Backend trả về message trong error.response.data.Message hoặc error.response.data.message
                const message = error.response.data?.Message || error.response.data?.message || 'Không thể gửi lời mời';
                console.error('Invite error details:', error.response.data);
                throw new Error(message);
            }
            if (error.response?.status === 403) {
                throw new Error('Bạn không có quyền gửi lời mời cho startup này');
            }
            throw error;
        }
    },

    // DEPRECATED: Use getMyInvitations (received-invites endpoint) instead

    // POST: api/teamstartups/{id}/accept-invite - Accept invitation (receiver)
    acceptInvitation: async (id: number): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.post(`/api/TeamStartUps/${id}/accept-invite`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Không thể chấp nhận lời mời';
                throw new Error(message);
            }
            if (error.response?.status === 404) {
                throw new Error('Lời mời không tồn tại');
            }
            throw error;
        }
    },

    // POST: api/teamstartups/{id}/reject-invite - Reject invitation (receiver)
    rejectInvitation: async (id: number, reason?: string): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.post(`/api/TeamStartUps/${id}/reject-invite`, 
                reason ? { reason } : {}
            );
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Không thể từ chối lời mời';
                throw new Error(message);
            }
            if (error.response?.status === 404) {
                throw new Error('Lời mời không tồn tại');
            }
            throw error;
        }
    },

    // POST: api/teamstartups/{id}/cancel-request - Cancel request
    cancelRequest: async (id: number): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.post(`/api/TeamStartUps/${id}/cancel-request`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Không thể hủy yêu cầu';
                throw new Error(message);
            }
            if (error.response?.status === 404) {
                throw new Error('Yêu cầu không tồn tại');
            }
            throw error;
        }
    },

    // POST: api/teamstartups/{id}/accept-invite - Change status to Dealing (Accepted by invitee)
    moveToDealing: async (id: number): Promise<AxiosResponse> => {
        try {
            // Sử dụng API accept-invite để chuyển sang Dealing
            const response = await AxiosService.post(`/api/TeamStartUps/${id}/accept-invite`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Không thể chấp nhận lời mời';
                throw new Error(message);
            }
            if (error.response?.status === 404) {
                throw new Error('Lời mời không tồn tại');
            }
            throw error;
        }
    },

    // POST: api/teamstartups/{id}/confirm-success - Mark as Success (Owner finalizes)
    markAsSuccess: async (id: number): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.post(`/api/TeamStartUps/${id}/confirm-success`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Không thể hoàn tất lời mời';
                throw new Error(message);
            }
            if (error.response?.status === 403) {
                throw new Error('Chỉ chủ startup mới có quyền hoàn tất');
            }
            if (error.response?.status === 404) {
                throw new Error('Lời mời không tồn tại');
            }
            throw error;
        }
    },

    // GET: api/teamstartups/sent-invites - Lấy danh sách lời mời đã gửi (for owner)
    getMySentInvitations: async (status?: string): Promise<AxiosResponse<PaginatedTeamStartUpsResponse>> => {
        try {
            const params = new URLSearchParams();
            if (status) {
                // Convert string status to enum number
                const statusMap: { [key: string]: number } = {
                    'Pending': 0,
                    'Dealing': 1,
                    'Success': 2,
                    'Rejected': 3
                };
                params.append('status', statusMap[status]?.toString() || '0');
            }
            
            const response = await AxiosService.get<PaginatedTeamStartUpsResponse>(
                `/api/TeamStartUps/sent-invites?${params.toString()}`
            );
            return response;
        } catch (error: any) {
            throw error;
        }
    },

    // GET: api/teamstartups/received-invites - Lấy danh sách lời mời nhận được (for receiver)
    getMyInvitations: async (status?: string): Promise<AxiosResponse<PaginatedTeamStartUpsResponse>> => {
        try {
            const params = new URLSearchParams();
            if (status) {
                // Convert string status to enum number
                const statusMap: { [key: string]: number } = {
                    'Pending': 0,
                    'Dealing': 1,
                    'Success': 2,
                    'Rejected': 3
                };
                params.append('status', statusMap[status]?.toString() || '0');
            }
            
            const response = await AxiosService.get<PaginatedTeamStartUpsResponse>(
                `/api/TeamStartUps/received-invites?${params.toString()}`
            );
            return response;
        } catch (error: any) {
            throw error;
        }
    },

    // POST: api/teamstartups/{id}/cancel-invite - Cancel invitation (owner, when Pending)
    cancelInvite: async (id: number): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.post(`/api/TeamStartUps/${id}/cancel-invite`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Không thể hủy lời mời';
                throw new Error(message);
            }
            if (error.response?.status === 404) {
                throw new Error('Lời mời không tồn tại');
            }
            throw error;
        }
    },

    // POST: api/teamstartups/{id}/cancel-dealing - Cancel dealing (owner, when Dealing)
    cancelDealing: async (id: number, reason?: string): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.post(`/api/TeamStartUps/${id}/cancel-dealing`, 
                reason ? { reason } : {}
            );
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Không thể hủy bỏ';
                throw new Error(message);
            }
            if (error.response?.status === 404) {
                throw new Error('Lời mời không tồn tại');
            }
            throw error;
        }
    },

    // GET: api/teamstartups/dealing-chats - Lấy danh sách đang Dealing (both owner and receiver)
    getDealingChats: async (): Promise<AxiosResponse<PaginatedTeamStartUpsResponse>> => {
        try {
            const response = await AxiosService.get<PaginatedTeamStartUpsResponse>(
                '/api/TeamStartUps/dealing-chats'
            );
            return response;
        } catch (error: any) {
            throw error;
        }
    },

    // GET: api/teamstartups/my-team-members - Lấy thành viên đã Success
    getMyTeamMembers: async (startUpId?: number): Promise<AxiosResponse<PaginatedTeamStartUpsResponse>> => {
        try {
            const params = new URLSearchParams();
            if (startUpId) params.append('startUpId', startUpId.toString());
            
            const response = await AxiosService.get<PaginatedTeamStartUpsResponse>(
                `/api/TeamStartUps/my-team-members?${params.toString()}`
            );
            return response;
        } catch (error: any) {
            throw error;
        }
    },

    // POST: api/teamstartups/invite - Send invitation (owner)
    sendInvitation: async (startUpId: number, userId: string): Promise<AxiosResponse> => {
        try {
            const data: CreateTeamStartUpDtoType = {
                startUpId,
                userId
            };
            const response = await AxiosService.post('/api/TeamStartUps/invite', data);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Không thể gửi lời mời';
                throw new Error(message);
            }
            throw error;
        }
    },

    // POST: api/teamstartups/{id}/remove-member - Remove member (owner)
    removeMember: async (id: number): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.post(`/api/TeamStartUps/${id}/remove-member`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Không thể xóa thành viên';
                throw new Error(message);
            }
            if (error.response?.status === 404) {
                throw new Error('Thành viên không tồn tại');
            }
            throw error;
        }
    },

};

export default TeamStartupService;
