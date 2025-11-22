import type { AxiosResponse } from 'axios';
import type { CommentDto, CreateCommentDto, UpdateCommentDto } from '../types/CommentType';
import AxiosService from './AxiosService';

export const CommentService = {
    // Get comments by startup ID (includes nested replies)
    getCommentsByStartup: async (startupId: number): Promise<AxiosResponse<CommentDto[]>> => {
        try {
            const response = await AxiosService.get<CommentDto[]>(`/api/Comments/startup/${startupId}`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Startup không tồn tại');
            }
            throw error;
        }
    },

    // Get comment by ID (with replies)
    getCommentById: async (id: number): Promise<AxiosResponse<CommentDto>> => {
        try {
            const response = await AxiosService.get<CommentDto>(`/api/Comments/${id}`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Bình luận không tồn tại');
            }
            throw error;
        }
    },

    // Create a new comment or reply
    createComment: async (data: CreateCommentDto): Promise<AxiosResponse<CommentDto>> => {
        try {
            const response = await AxiosService.post<CommentDto>('/api/Comments', data);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Thông tin bình luận không hợp lệ';
                throw new Error(message);
            }
            throw error;
        }
    },

    // Update a comment
    updateComment: async (id: number, data: UpdateCommentDto): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.put(`/api/Comments/${id}`, data);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Thông tin cập nhật không hợp lệ';
                throw new Error(message);
            }
            if (error.response?.status === 403) {
                throw new Error('Bạn không có quyền chỉnh sửa bình luận này');
            }
            if (error.response?.status === 404) {
                throw new Error('Bình luận không tồn tại');
            }
            throw error;
        }
    },

    // Delete a comment (soft delete)
    deleteComment: async (id: number): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.delete(`/api/Comments/${id}`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error('Bạn không có quyền xóa bình luận này');
            }
            if (error.response?.status === 404) {
                throw new Error('Bình luận không tồn tại');
            }
            throw error;
        }
    },
};

export default CommentService;
