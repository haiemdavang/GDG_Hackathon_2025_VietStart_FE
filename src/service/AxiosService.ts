import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class AxiosService {
    private axiosInstance: AxiosInstance;
    private publicAxiosInstance: AxiosInstance;
    private isRefreshing = false;
    private failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

    constructor() {
        // Authenticated instance with interceptors
        this.axiosInstance = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Public instance without auth interceptors
        this.publicAxiosInstance = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private processQueue(error: any, token: string | null = null) {
        this.failedQueue.forEach(prom => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(token);
            }
        });
        this.failedQueue = [];
    }

    private setupInterceptors() {
        // Request interceptor - Add auth token
        this.axiosInstance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = this.getAccessToken();
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - Handle token refresh and errors
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (this.isRefreshing) {
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject });
                        })
                            .then(token => {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                                return this.axiosInstance(originalRequest);
                            })
                            .catch(err => Promise.reject(err));
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    const refreshToken = this.getRefreshToken();

                    if (!refreshToken) {
                        this.isRefreshing = false;
                        this.clearTokens();
                        window.location.href = '/login';
                        return Promise.reject(error);
                    }

                    try {
                        const response = await this.refreshAccessToken(refreshToken);
                        const newAccessToken = response.data.access_token;

                        this.setAccessToken(newAccessToken);
                        if (response.data.refresh_token) {
                            this.setRefreshToken(response.data.refresh_token);
                        }

                        this.processQueue(null, newAccessToken);
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        this.isRefreshing = false;

                        return this.axiosInstance(originalRequest);
                    } catch (refreshError) {
                        this.processQueue(refreshError, null);
                        this.isRefreshing = false;
                        this.clearTokens();
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    private async refreshAccessToken(refreshToken: string) {
        return await axios.post(`${API_BASE_URL}/api/Auth/RefreshToken`, {
            refresh_token: refreshToken,
        });
    }

    // Token management methods
    public getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    public setAccessToken(token: string): void {
        localStorage.setItem('accessToken', token);
    }

    public getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    public setRefreshToken(token: string): void {
        localStorage.setItem('refreshToken', token);
    }

    public clearTokens(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
    }

    public getUserIdFromToken(): string | null {
        const token = this.getAccessToken();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Handle XML schema namespace claims
            return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
                || payload.sub
                || payload.userId
                || payload.id
                || null;
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    }

    // HTTP methods with authentication
    public get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
        return this.axiosInstance.get<T>(url, config);
    }

    public post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
        return this.axiosInstance.post<T>(url, data, config);
    }

    public put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
        return this.axiosInstance.put<T>(url, data, config);
    }

    public patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
        return this.axiosInstance.patch<T>(url, data, config);
    }

    public delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
        return this.axiosInstance.delete<T>(url, config);
    }

    // Public HTTP methods without authentication
    public publicGet<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
        return this.publicAxiosInstance.get<T>(url, config);
    }

    public publicPost<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
        return this.publicAxiosInstance.post<T>(url, data, config);
    }

    public publicPut<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
        return this.publicAxiosInstance.put<T>(url, data, config);
    }

    public publicPatch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
        return this.publicAxiosInstance.patch<T>(url, data, config);
    }

    public publicDelete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
        return this.publicAxiosInstance.delete<T>(url, config);
    }
}

export default new AxiosService();
