export interface CategoryDto {
    id: number;
    name: string;
    description?: string;
    startupCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCategoryDto {
    name: string;
    description?: string;
}

export interface UpdateCategoryDto {
    name: string;
    description?: string;
}
