export interface CommentDto {
    id: number;
    userId: string;
    userFullName: string;
    userAvatar: string;
    startUpId: number;
    content: string;
    parentCommentId?: number;
    createdAt: string;
    updatedAt?: string;
    replies: CommentDto[];
}

export interface CreateCommentDto {
    startUpId: number;
    content: string;
    parentCommentId?: number;
}

export interface UpdateCommentDto {
    content: string;
}
