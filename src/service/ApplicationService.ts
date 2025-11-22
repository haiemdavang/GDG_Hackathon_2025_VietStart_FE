import type { AxiosResponse } from 'axios';
import type { ApplicationDto, CreateApplicationDto, UpdateApplicationStatusDto } from '../types/ApplicationType';
import AxiosService from './AxiosService';

export const ApplicationService = {
    // Submit application
    submitApplication: async (data: CreateApplicationDto): Promise<AxiosResponse<ApplicationDto>> => {
        try {
            const formData = new FormData();
            formData.append('startupId', data.startupId.toString());
            formData.append('role', data.role);
            formData.append('experience', data.experience);
            formData.append('motivation', data.motivation);
            formData.append('cv', data.cv);
            if (data.portfolio) {
                formData.append('portfolio', data.portfolio);
            }

            const response = await AxiosService.post<ApplicationDto>(
                '/api/Applications',
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
                throw new Error('Thông tin ứng tuyển không hợp lệ');
            }
            throw error;
        }
    },

    // Get applications by startup
    getApplicationsByStartup: async (startupId: number): Promise<AxiosResponse<ApplicationDto[]>> => {
        try {
            const response = await AxiosService.get<ApplicationDto[]>(`/api/Applications/startup/${startupId}`);
            return response;
        } catch (error: any) {
            throw error;
        }
    },

    // Get user's applications
    getMyApplications: async (): Promise<AxiosResponse<ApplicationDto[]>> => {
        try {
            const response = await AxiosService.get<ApplicationDto[]>('/api/Applications/my');
            return response;
        } catch (error: any) {
            throw error;
        }
    },

    // Update application status
    updateApplicationStatus: async (
        applicationId: number,
        data: UpdateApplicationStatusDto
    ): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.put(`/api/Applications/${applicationId}/status`, data);
            return response;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error('Bạn không có quyền cập nhật đơn ứng tuyển này');
            }
            throw error;
        }
    },

    // Delete application
    deleteApplication: async (applicationId: number): Promise<AxiosResponse> => {
        try {
            const response = await AxiosService.delete(`/api/Applications/${applicationId}`);
            return response;
        } catch (error: any) {
            throw error;
        }
    },
};

export default ApplicationService;
