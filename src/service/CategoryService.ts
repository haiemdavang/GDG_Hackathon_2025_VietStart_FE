import type { AxiosResponse } from 'axios';
import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../types/CategoryType';
import AxiosService from './AxiosService';

export const CategoryService = {
    // Get all categories
    getAllCategories: async (): Promise<AxiosResponse<CategoryDto[]>> => {
        try {
            const response = await AxiosService.get<CategoryDto[]>('/api/Categories');
            return response;
        } catch (error: any) {
            throw error;
        }
    },

    // Get category by ID
    getCategoryById: async (id: number): Promise<AxiosResponse<CategoryDto>> => {
        try {
            const response = await AxiosService.get<CategoryDto>(`/api/Categories/${id}`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Danh mục không tồn tại');
            }
            throw error;
        }
    },

    // Create new category (Admin only)
    createCategory: async (data: CreateCategoryDto): Promise<AxiosResponse<CategoryDto>> => {
        try {
            const response = await AxiosService.post<CategoryDto>('/api/Categories', data);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new Error('Thông tin danh mục không hợp lệ');
            }
            if (error.response?.status === 401) {
                throw new Error('Bạn cần đăng nhập');
            }
            if (error.response?.status === 403) {
                throw new Error('Bạn không có quyền tạo danh mục');
            }
            throw error;
        }
    },

    // Update category (Admin only)
    updateCategory: async (id: number, data: UpdateCategoryDto): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.put(`/api/Categories/${id}`, data);
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new Error('Thông tin cập nhật không hợp lệ');
            }
            if (error.response?.status === 403) {
                throw new Error('Bạn không có quyền chỉnh sửa danh mục');
            }
            if (error.response?.status === 404) {
                throw new Error('Danh mục không tồn tại');
            }
            throw error;
        }
    },

    // Delete category (Admin only)
    deleteCategory: async (id: number): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.delete(`/api/Categories/${id}`);
            return response;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error('Bạn không có quyền xóa danh mục');
            }
            if (error.response?.status === 404) {
                throw new Error('Danh mục không tồn tại');
            }
            throw error;
        }
    },
};

export default CategoryService;
