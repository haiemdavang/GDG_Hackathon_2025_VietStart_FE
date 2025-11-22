export interface PositionDto {
    id: number;
    name: string;
}

export interface CreatePositionDto {
    name: string;
}

export interface UpdatePositionDto {
    name: string;
}

export interface TeamStartUpDto {
    id: number;
    startUpId: number;
    startUpIdea: string;
    userId: string;
    userFullName: string;
    userAvatar: string;
    positionId: number;
    positionName: string;
    experience?: string;
    motivation?: string;
    status: string;
}

export interface TeamStartUpDetailDto {
    id: number;
    startUpId: number;
    userId: string;
    positionId: number;
    experience?: string;
    motivation?: string;
    status: string;
    user: {
        id: string;
        fullName: string;
        email: string;
        avatar?: string;
    };
    startUp: {
        id: number;
        idea: string;
        point: number;
    };
    position: PositionDto;
}

export interface CreateTeamStartUpDto {
    startUpId: number;
    userId: string;
    positionId: number;
    experience?: string;
    motivation?: string;
    status?: string; // Default: "Đang chờ"
}

export interface UpdateTeamStartUpDto {
    positionId: number;
    experience?: string;
    motivation?: string;
    status: string;
}

// Status constants
export const TEAM_STATUS = {
    PENDING: 'Đang chờ',
    APPROVED: 'Đã chấp nhận',
    REJECTED: 'Đã từ chối',
} as const;

export type TeamStatus = typeof TEAM_STATUS[keyof typeof TEAM_STATUS];
