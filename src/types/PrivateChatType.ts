export interface PrivateChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  message: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: Date;
  isRead: boolean;
}

export interface PrivateChatRoom {
  id: string;
  participants: string[]; // Array of 2 user IDs
  participantNames: { [userId: string]: string };
  participantAvatars: { [userId: string]: string };
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: { [userId: string]: number };
  createdAt: Date;
  // Context cho invitation
  invitationId?: number;
  invitationStatus?: string;
  startupId?: number;
  startupName?: string;
  startupOwnerId?: string; // ID của chủ startup
}

export interface InvitationDto {
  id: number;
  startUpId: number;
  startUpIdea: string;
  startUpName?: string;
  userId: string;
  userFullName: string;
  userAvatar?: string;
  status: 'Pending' | 'Dealing' | 'Success' | 'Rejected';
  createdAt?: Date;
  // For owner perspective
  ownerUserId?: string;
  isOwner?: boolean;
}
