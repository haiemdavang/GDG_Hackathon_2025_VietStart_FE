import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  updateDoc,
  doc,
  getDocs,
  setDoc,
  getDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { PrivateChatMessage, PrivateChatRoom } from '../types/PrivateChatType';

export const PrivateChatService = {
  /**
   * Tạo hoặc lấy private chat room giữa 2 users
   */
  getOrCreatePrivateChatRoom: async (
    userId1: string,
    userId2: string,
    user1Name: string,
    user2Name: string,
    user1Avatar?: string,
    user2Avatar?: string,
    invitationId?: number,
    startupId?: number,
    startupName?: string,
    startupOwnerId?: string
  ): Promise<string> => {
    // Validate: không được chat với chính mình
    if (userId1 === userId2) {
      throw new Error('Không thể tạo chat room với chính mình');
    }
    
    // Tạo ID duy nhất: nếu có invitationId thì dùng để tạo room riêng cho mỗi invitation
    const participants = [userId1, userId2].sort();
    const roomId = invitationId 
      ? `private_invitation_${invitationId}_${participants[0]}_${participants[1]}`
      : `private_${participants[0]}_${participants[1]}`;
    
    const roomRef = doc(db, 'privateChatRooms', roomId);
    const roomDoc = await getDoc(roomRef);

    if (!roomDoc.exists()) {
      await setDoc(roomRef, {
        participants,
        participantNames: {
          [userId1]: user1Name,
          [userId2]: user2Name
        },
        participantAvatars: {
          [userId1]: user1Avatar || '',
          [userId2]: user2Avatar || ''
        },
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          [userId1]: 0,
          [userId2]: 0
        },
        invitationId: invitationId || null,
        invitationStatus: invitationId ? 'Pending' : null,
        startupId: startupId || null,
        startupName: startupName || '',
        startupOwnerId: startupOwnerId || null
      });
    } else {
      // Update context nếu có thay đổi (không ghi đè invitation cũ)
      const updates: any = {};
      if (invitationId && !roomDoc.data().invitationId) {
        updates.invitationId = invitationId;
        updates.invitationStatus = 'Pending';
      }
      if (startupId) updates.startupId = startupId;
      if (startupName) updates.startupName = startupName;
      if (startupOwnerId) updates.startupOwnerId = startupOwnerId;
      
      if (Object.keys(updates).length > 0) {
        await updateDoc(roomRef, updates);
      }
    }

    return roomId;
  },

  /**
   * Gửi tin nhắn văn bản trong private chat
   */
  sendPrivateMessage: async (
    chatRoomId: string,
    senderId: string,
    senderName: string,
    receiverId: string,
    message: string,
    senderAvatar?: string
  ): Promise<void> => {
    if (!message.trim()) return;

    const messageData = {
      chatRoomId,
      senderId,
      senderName,
      senderAvatar: senderAvatar || '',
      receiverId,
      message: message.trim(),
      fileUrl: '',
      fileName: '',
      imageUrl: '',
      createdAt: serverTimestamp(),
      isRead: false
    };

    await addDoc(collection(db, 'privateMessages'), messageData);

    // Cập nhật last message và unread count
    const roomRef = doc(db, 'privateChatRooms', chatRoomId);
    const roomDoc = await getDoc(roomRef);
    
    if (roomDoc.exists()) {
      const currentUnread = roomDoc.data().unreadCount || {};
      await updateDoc(roomRef, {
        lastMessage: message.trim(),
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${receiverId}`]: (currentUnread[receiverId] || 0) + 1
      });
    }
  },

  /**
   * Gửi tin nhắn kèm file
   */
  sendPrivateMessageWithFile: async (
    chatRoomId: string,
    senderId: string,
    senderName: string,
    receiverId: string,
    message: string,
    file: File,
    senderAvatar?: string
  ): Promise<void> => {
    try {
      // Upload file
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(
        storage,
        `privateChat/${chatRoomId}/${timestamp}_${sanitizedFileName}`
      );
      
      const snapshot = await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(snapshot.ref);
      const isImage = file.type.startsWith('image/');

      const messageData = {
        chatRoomId,
        senderId,
        senderName,
        senderAvatar: senderAvatar || '',
        receiverId,
        message: message.trim() || '',
        fileUrl,
        fileName: file.name,
        imageUrl: isImage ? fileUrl : '',
        createdAt: serverTimestamp(),
        isRead: false
      };

      await addDoc(collection(db, 'privateMessages'), messageData);

      // Update room
      const roomRef = doc(db, 'privateChatRooms', chatRoomId);
      const roomDoc = await getDoc(roomRef);
      
      if (roomDoc.exists()) {
        const currentUnread = roomDoc.data().unreadCount || {};
        const lastMsg = message.trim() || `📎 ${file.name}`;
        await updateDoc(roomRef, {
          lastMessage: lastMsg,
          lastMessageTime: serverTimestamp(),
          [`unreadCount.${receiverId}`]: (currentUnread[receiverId] || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error sending file:', error);
      throw new Error('Không thể gửi file. Vui lòng thử lại.');
    }
  },

  /**
   * Lắng nghe tin nhắn realtime
   */
  subscribeToPrivateMessages: (
    chatRoomId: string,
    callback: (messages: PrivateChatMessage[]) => void
  ) => {
    const q = query(
      collection(db, 'privateMessages'),
      where('chatRoomId', '==', chatRoomId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as PrivateChatMessage;
      });

      callback(messages);
    });
  },

  /**
   * Lấy danh sách private chat rooms của user
   */
  getUserPrivateChatRooms: async (userId: string): Promise<PrivateChatRoom[]> => {
    const q = query(
      collection(db, 'privateChatRooms'),
      where('participants', 'array-contains', userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastMessageTime: data.lastMessageTime?.toDate()
      } as PrivateChatRoom;
    });
  },

  /**
   * Đánh dấu tin nhắn đã đọc
   */
  markPrivateMessagesAsRead: async (
    chatRoomId: string,
    userId: string
  ): Promise<void> => {
    const q = query(
      collection(db, 'privateMessages'),
      where('chatRoomId', '==', chatRoomId),
      where('receiverId', '==', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();

    // Reset unread count
    const roomRef = doc(db, 'privateChatRooms', chatRoomId);
    await updateDoc(roomRef, {
      [`unreadCount.${userId}`]: 0
    });
  },

  /**
   * Lấy thông tin chat room
   */
  getChatRoomInfo: async (chatRoomId: string): Promise<PrivateChatRoom | null> => {
    const roomRef = doc(db, 'privateChatRooms', chatRoomId);
    const roomDoc = await getDoc(roomRef);

    if (!roomDoc.exists()) return null;

    const data = roomDoc.data();
    return {
      id: roomDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastMessageTime: data.lastMessageTime?.toDate()
    } as PrivateChatRoom;
  },

  /**
   * Cập nhật status của invitation trong chat room
   */
  updateChatRoomInvitationStatus: async (
    chatRoomId: string,
    status: 'Pending' | 'Dealing' | 'Success' | 'Rejected'
  ): Promise<void> => {
    const roomRef = doc(db, 'privateChatRooms', chatRoomId);
    await updateDoc(roomRef, {
      invitationStatus: status
    });
  }
};
