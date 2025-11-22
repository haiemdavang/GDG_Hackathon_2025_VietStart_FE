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
import type { ChatMessage, ChatRoom } from '../types/ChatType';

export const ChatService = {
  /**
   * Tạo hoặc lấy chat room cho startup
   */
  getOrCreateChatRoom: async (
    startupId: number,
    startupName: string,
    members: string[]
  ): Promise<string> => {
    console.log('getOrCreateChatRoom called:', { startupId, startupName, members });
    
    if (!startupName || startupName.trim() === '') {
      throw new Error('startupName không được để trống');
    }
    
    const roomId = `startup_${startupId}`;
    const roomRef = doc(db, 'chatRooms', roomId);
    const roomDoc = await getDoc(roomRef);

    if (!roomDoc.exists()) {
      // Khi tạo mới: yêu cầu phải có ít nhất 1 member
      if (!members || members.length === 0) {
        throw new Error('members array không được rỗng khi tạo chat room mới');
      }
      
      console.log('Creating new chat room:', roomId, 'with members:', members);
      const chatRoomData = {
        startupId,
        startupName: startupName.trim(),
        members: members,
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: 0
      };
      console.log('Chat room data to create:', chatRoomData);
      await setDoc(roomRef, chatRoomData);
      console.log('Chat room created successfully');
    } else {
      console.log('Chat room already exists');
      // Nếu room đã tồn tại và có members mới, cập nhật
      if (members && members.length > 0) {
        const currentMembers = roomDoc.data().members || [];
        const newMembers = [...new Set([...currentMembers, ...members])];
        
        if (newMembers.length !== currentMembers.length) {
          await updateDoc(roomRef, { members: newMembers });
          console.log('Members updated:', newMembers);
        } else {
          console.log('No new members to add');
        }
      } else {
        console.log('No members provided, room already exists, skipping member update');
      }
    }

    return roomId;
  },

  /**
   * Thêm thành viên vào chat room đã tồn tại
   * Nếu chat room chưa tồn tại, tự động tạo mới với owner
   */
  addMemberToRoom: async (
    startupId: number,
    userId: string,
    startupName?: string,
    ownerId?: string
  ): Promise<void> => {
    console.log('addMemberToRoom called:', { startupId, userId, startupName, ownerId });
    
    const roomId = `startup_${startupId}`;
    const roomRef = doc(db, 'chatRooms', roomId);
    const roomDoc = await getDoc(roomRef);

    if (!roomDoc.exists()) {
      console.warn('Chat room does not exist, creating it now...');
      // Nếu room chưa tồn tại, tạo mới với owner và member
      const members = ownerId ? [ownerId, userId] : [userId];
      const name = startupName || `Startup ${startupId}`;
      
      await setDoc(roomRef, {
        startupId,
        startupName: name,
        members: [...new Set(members)], // Remove duplicates
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: 0
      });
      console.log('Chat room created with members:', members);
      return;
    }

    const currentMembers = roomDoc.data().members || [];
    
    // Chỉ thêm nếu chưa có trong danh sách
    if (!currentMembers.includes(userId)) {
      await updateDoc(roomRef, {
        members: [...currentMembers, userId]
      });
      console.log('Member added to existing room:', userId);
    } else {
      console.log('Member already in room:', userId);
    }
  },

  /**
   * Gửi tin nhắn văn bản
   */
  sendMessage: async (
    startupId: number,
    userId: string,
    userName: string,
    message: string,
    userAvatar?: string
  ): Promise<void> => {
    if (!message.trim()) return;

    const messageData = {
      startupId,
      userId,
      userName,
      userAvatar: userAvatar || '',
      message: message.trim(),
      fileUrl: '',
      fileName: '',
      imageUrl: '',
      createdAt: serverTimestamp(),
      isRead: false
    };

    await addDoc(collection(db, 'messages'), messageData);

    // Cập nhật last message trong room
    const roomRef = doc(db, 'chatRooms', `startup_${startupId}`);
    await updateDoc(roomRef, {
      lastMessage: message.trim(),
      lastMessageTime: serverTimestamp()
    });
  },

  /**
   * Gửi tin nhắn kèm file
   */
  sendMessageWithFile: async (
    startupId: number,
    userId: string,
    userName: string,
    message: string,
    file: File,
    userAvatar?: string
  ): Promise<void> => {
    try {
      // Upload file lên Storage
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(
        storage,
        `chat/${startupId}/${timestamp}_${sanitizedFileName}`
      );
      
      const snapshot = await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(snapshot.ref);

      // Kiểm tra xem có phải là ảnh không
      const isImage = file.type.startsWith('image/');

      const messageData = {
        startupId,
        userId,
        userName,
        userAvatar: userAvatar || '',
        message: message.trim() || '',
        fileUrl,
        fileName: file.name,
        imageUrl: isImage ? fileUrl : '',
        createdAt: serverTimestamp(),
        isRead: false
      };

      await addDoc(collection(db, 'messages'), messageData);

      // Cập nhật last message trong room
      const roomRef = doc(db, 'chatRooms', `startup_${startupId}`);
      const lastMsg = message.trim() || `📎 ${file.name}`;
      await updateDoc(roomRef, {
        lastMessage: lastMsg,
        lastMessageTime: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending file:', error);
      throw new Error('Không thể gửi file. Vui lòng thử lại.');
    }
  },

  /**
   * Lắng nghe tin nhắn realtime
   */
  subscribeToMessages: (
    startupId: number,
    callback: (messages: ChatMessage[]) => void
  ) => {
    const q = query(
      collection(db, 'messages'),
      where('startupId', '==', startupId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as ChatMessage;
      });

      callback(messages);
    });
  },

  /**
   * Lấy thông tin chat room
   */
  getChatRoomInfo: async (roomId: string): Promise<ChatRoom | null> => {
    const roomRef = doc(db, 'chatRooms', roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      return null;
    }
    
    const data = roomDoc.data();
    return {
      id: roomDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastMessageTime: data.lastMessageTime?.toDate()
    } as ChatRoom;
  },

  /**
   * Lấy danh sách chat rooms của user
   */
  getUserChatRooms: async (userId: string): Promise<ChatRoom[]> => {
    const q = query(
      collection(db, 'chatRooms'),
      where('members', 'array-contains', userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastMessageTime: data.lastMessageTime?.toDate()
      } as ChatRoom;
    });
  },

  /**
   * Đánh dấu tin nhắn đã đọc
   */
  markMessagesAsRead: async (
    startupId: number,
    userId: string
  ): Promise<void> => {
    const q = query(
      collection(db, 'messages'),
      where('startupId', '==', startupId),
      where('userId', '!=', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();
  },

  /**
   * Xóa tin nhắn (chỉ người gửi mới xóa được)
   */
  deleteMessage: async (
    messageId: string,
    userId: string
  ): Promise<void> => {
    const messageRef = doc(db, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);

    if (!messageDoc.exists()) {
      throw new Error('Tin nhắn không tồn tại');
    }

    if (messageDoc.data().userId !== userId) {
      throw new Error('Bạn không có quyền xóa tin nhắn này');
    }

    await updateDoc(messageRef, {
      message: 'Tin nhắn đã được xóa',
      fileUrl: '',
      fileName: '',
      imageUrl: ''
    });
  }
};