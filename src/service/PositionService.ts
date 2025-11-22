import type { AxiosResponse } from 'axios';
import type { CreatePositionDto, PositionDto, UpdatePositionDto } from '../types/StartupPositionType';
import AxiosService from './AxiosService';

export const PositionService = {
    // Get all positions with optional search
    getPositions: async (keyword?: string): Promise<AxiosResponse<PositionDto[]>> => {
        try {
            const params = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
            const response = await AxiosService.get<PositionDto[]>(`/api/Positions${params}`);
            return response;
        } catch (error: any) {
            throw error;
        }
    },

    // Get position by ID
    getPositionById: async (id: number): Promise<AxiosResponse<PositionDto>> => {
        try {
            const response = await AxiosService.get<PositionDto>(`/api/Positions/${id}`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Position không tồn tại');
            }
            throw error;
        }
    },

    // Get position by name
    getPositionByName: async (name: string): Promise<AxiosResponse<PositionDto>> => {
        try {
            const response = await AxiosService.get<PositionDto>(`/api/Positions/name/${encodeURIComponent(name)}`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Position không tồn tại');
            }
            throw error;
        }
    },

    // Create new position (Admin only)
    createPosition: async (data: CreatePositionDto): Promise<AxiosResponse<PositionDto>> => {
        try {
            const response = await AxiosService.post<PositionDto>('/api/Positions', data);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Position với tên này đã tồn tại';
                throw new Error(message);
            }
            throw error;
        }
    },

    // Update position (Admin only)
    updatePosition: async (id: number, data: UpdatePositionDto): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.put(`/api/Positions/${id}`, data);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response.data?.Message || 'Position với tên này đã tồn tại';
                throw new Error(message);
            }
            if (error.response?.status === 404) {
                throw new Error('Position không tồn tại');
            }
            throw error;
        }
    },

    // Delete position (Admin only)
    deletePosition: async (id: number): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.delete(`/api/Positions/${id}`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new Error('Không thể xóa Position đang được sử dụng');
            }
            if (error.response?.status === 404) {
                throw new Error('Position không tồn tại');
            }
            throw error;
        }
    },
};

export default PositionService;
