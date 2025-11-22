export interface ApplicationDto {
    id: number;
    startupId: number;
    userId: string;
    role: string;
    experience: string;
    motivation: string;
    cvUrl: string;
    portfolio?: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    updatedAt?: string;
}

export interface CreateApplicationDto {
    startupId: number;
    role: string;
    experience: string;
    motivation: string;
    cv: File;
    portfolio?: string;
}

export interface UpdateApplicationStatusDto {
    status: 'pending' | 'accepted' | 'rejected';
    feedback?: string;
}
