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
