export interface StartUpDto {
  id: number;
  team: string;
  idea: string;
  prototype: string;
  plan: string;
  relationship: string;
  privacy: number;
  point: number;
  userId: string;
  userFullName?: string;
  categoryId: number;
  categoryName?: string;
  createdAt: string;
  updatedAt?: string;
  prototypePoint?: number;
  planPoint?: number;
  relationshipPoint?: number;
  teamPoint?: number;
  ideaPoint?: number;
  applicants?: Array<{
    id: number;
    name: string;
    avatar: string;
  }>;
  applicantCount?: number;
}

export interface CreateStartUpDto {
  team: string;
  idea: string;
  prototype: string;
  plan: string;
  relationship: string;
  privacy: number;
  point: number;
  categoryId: number;
  ideaPoint?: number;
  prototypePoint?: number;
  planPoint?: number;
  relationshipPoint?: number;
  teamPoint?: number;
}

export interface UpdateStartUpDto {
  team: string;
  idea: string;
  prototype: string;
  plan: string;
  relationship: string;
  privacy: number;
  point: number;
  categoryId: number;
}

export interface StartUpDetailDto extends StartUpDto {
  comments?: any[];
  likes?: any[];
}

export interface PaginatedStartupsResponse {
  data: StartUpDto[];
  total: number;
}

export interface UserSuggestionDto {
  userId: string;
  fullName: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  skills: string | null;
  rolesInStartup: string | null;
  categoryInvests: string | null;
  matchScore: number;
}

export interface SuggestUsersResponse {
  startupId: number;
  startupName: string;
  startupTeam: string;
  hasTeamEmbedding: boolean;
  totalSuggestions: number;
  suggestions: UserSuggestionDto[];
}

export interface GroupedSuggestionsDto {
  bySkills: UserSuggestionDto[];
  byRoles: UserSuggestionDto[];
  byCategory: UserSuggestionDto[];
  overall: UserSuggestionDto[];
}

export interface GroupedSuggestionsResponse {
  startupId: number;
  startupName: string;
  startupTeam: string;
  hasTeamEmbedding: boolean;
  groupedSuggestions: {
    bySkills: {
      count: number;
      users: UserSuggestionDto[];
    };
    byRoles: {
      count: number;
      users: UserSuggestionDto[];
    };
    byCategory: {
      count: number;
      users: UserSuggestionDto[];
    };
    overall: {
      count: number;
      users: UserSuggestionDto[];
    };
  };
}

export interface RecalculateEmbeddingsResponse {
  message: string;
  startupId: number;
  hasTeamEmbedding: boolean;
}

export interface CreateTeamStartUpDtoType {
  startUpId: number;
  userId: string;
  status?: string; 
}