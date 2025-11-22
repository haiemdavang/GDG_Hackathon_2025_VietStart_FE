export interface ChatMessage {
  id: string;
  startupId: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: Date;
  isRead: boolean;
}

export interface ChatRoom {
  id: string;
  startupId: number;
  startupName: string;
  members: string[];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  createdAt: Date;
}

export interface ChatMember {
  userId: string;
  userName: string;
  userAvatar?: string;
  role: string;
  joinedAt: Date;
}