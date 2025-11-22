export interface ProfileData {
    fullName: string;
    location: string;
    bio: string;
    avatar: string;
    dob: string;
}

export interface UserProfile extends ProfileData {
    email?: string;
    username?: string;
    ideasCount?: number;
    followingCount?: number;
    followersCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
