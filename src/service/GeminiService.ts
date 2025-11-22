import type { AxiosResponse } from 'axios';
import type {
    FormatInputResponse,
    PointResponse,
    StartupInfo
} from '../types/GeminiType';
import AxiosService from './AxiosService';

export const GeminiService = {
    // Format user input into structured StartupInfo
    formatInput: async (clientAnswer: string): Promise<AxiosResponse<FormatInputResponse>> => {
        try {
            const response = await AxiosService.post<FormatInputResponse>(
                '/api/Gemini/format',
                JSON.stringify(clientAnswer),
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Convert uppercase fields to lowercase
            if (response.data.formatted) {
                const formatted = response.data.formatted as any;
                response.data.formatted = {
                    team: formatted.Team || formatted.team || '',
                    idea: formatted.Idea || formatted.idea || '',
                    prototype: formatted.Prototype || formatted.prototype || '',
                    plan: formatted.Plan || formatted.plan || '',
                    relationships: formatted.Relationships || formatted.relationships || ''
                };
            }

            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new Error('Nội dung không được để trống');
            }
            if (error.response?.status === 503) {
                throw new Error('Dịch vụ AI tạm thời quá tải, vui lòng thử lại');
            }
            throw error;
        }
    },

    // Calculate points for startup based on criteria
    calculatePoints: async (startupInfo: StartupInfo): Promise<AxiosResponse<PointResponse>> => {
        try {
            // Convert to uppercase for API
            const apiPayload = {
                Team: startupInfo.team,
                Idea: startupInfo.idea,
                Prototype: startupInfo.prototype,
                Plan: startupInfo.plan,
                Relationships: startupInfo.relationships
            };

            const response = await AxiosService.post<PointResponse>(
                '/api/Gemini/point',
                apiPayload
            );
            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new Error('Thông tin startup không hợp lệ');
            }
            if (error.response?.status === 503) {
                throw new Error('Dịch vụ AI tạm thời quá tải, vui lòng thử lại');
            }
            throw error;
        }
    },

    // Format and calculate points in one call
    formatAndCalculate: async (clientAnswer: string): Promise<{
        formatted: StartupInfo;
        score: PointResponse;
    }> => {
        try {
            // Step 1: Format the input
            const formatResponse = await GeminiService.formatInput(clientAnswer);
            const formatted = formatResponse.data.formatted;

            // Step 2: Calculate points
            const pointResponse = await GeminiService.calculatePoints(formatted);
            const score = pointResponse.data;

            return { formatted, score };
        } catch (error) {
            throw error;
        }
    },

    // Get AI suggestions for startup improvement
    getSuggest: async (startupInfo: StartupInfo): Promise<AxiosResponse<{ original: StartupInfo; suggestions: StartupInfo }>> => {
        try {
            // Convert to uppercase for API
            const apiPayload = {
                Team: startupInfo.team,
                Idea: startupInfo.idea,
                Prototype: startupInfo.prototype,
                Plan: startupInfo.plan,
                Relationships: startupInfo.relationships
            };

            const response = await AxiosService.post<{ original: StartupInfo; suggestions: StartupInfo }>(
                '/api/Gemini/suggest',
                apiPayload
            );

            // Convert response back to lowercase if needed
            if (response.data.suggestions) {
                const suggestions = response.data.suggestions as any;
                response.data.suggestions = {
                    team: suggestions.Team || suggestions.team || '',
                    idea: suggestions.Idea || suggestions.idea || '',
                    prototype: suggestions.Prototype || suggestions.prototype || '',
                    plan: suggestions.Plan || suggestions.plan || '',
                    relationships: suggestions.Relationships || suggestions.relationships || ''
                };
            }

            return response;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new Error('Thông tin startup không hợp lệ');
            }
            if (error.response?.status === 503) {
                throw new Error('Dịch vụ AI tạm thời quá tải, vui lòng thử lại');
            }
            throw error;
        }
    },
};

export default GeminiService;
