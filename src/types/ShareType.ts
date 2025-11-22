export interface ShareDto {
    userId: string;
    userFullName: string;
    startUpId: number;
    content: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateShareDto {
    startUpId: number;
    content: string;
}

export interface UpdateShareDto {
    content: string;
}

export interface ShareWithStartupDto extends ShareDto {
    startup?: {
        id: number;
        idea: string;
        point: number;
        categoryName?: string;
        userFullName?: string;
    };
}
