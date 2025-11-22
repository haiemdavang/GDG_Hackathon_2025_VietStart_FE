# Frontend Implementation Summary - VietStart Chat System

## ✅ Đã hoàn thiện

### 1. Service Layer Updates

#### **TeamStartupService.ts**
- ✅ Fix status parameter: Chuyển từ string → number (0-3) khi gọi API
- ✅ Update endpoints: `/accept-invite`, `/reject-invite`, `/confirm-success`
- ✅ Thêm methods mới: `cancelInvite()`, `cancelDealing()`, `getDealingChats()`, `getMyTeamMembers()`
- ✅ Fix `inviteStartUp()`: Xóa field `status` khỏi request body (backend tự set = Pending)

#### **PrivateChatService.ts**
- ✅ Fix `getOrCreatePrivateChatRoom()`: 
  - Tạo roomId riêng cho mỗi invitation: `private_invitation_{id}_{user1}_{user2}`
  - Thêm parameter `startupOwnerId`
  - Thêm fields vào Firestore: `invitationStatus`, `startupOwnerId`
  - Logic update context không ghi đè invitation cũ
- ✅ Thêm method `updateChatRoomInvitationStatus()`: Cập nhật status khi invitation thay đổi

### 2. Pages Updates

#### **Invitations.tsx** (Receiver View)
- ✅ Import `StartupService`
- ✅ `handleOpenPrivateChat()`: Fetch startup owner ID trước khi tạo chat room
- ✅ `handleAcceptInvitation()`: 
  - Fetch startup owner ID
  - Call API moveToDealing
  - Update Firebase chat room status → Dealing
  - Reload invitations list

#### **SentInvitations.tsx** (Owner View)
- ✅ `handleOpenPrivateChat()`: Truyền `currentUser.id` làm `startupOwnerId`
- ✅ `handleMarkAsSuccess()`:
  - Call API markAsSuccess
  - Tạo group chat trên Firebase
  - Update Firebase chat room status → Success
  - Reload invitations list

#### **PrivateChat.tsx**
- ✅ Import `CheckCircle` icon
- ✅ Thêm UI riêng cho từng trạng thái:
  - **Pending (Receiver)**: Alert vàng + nút Chấp nhận/Từ chối
  - **Dealing (Owner)**: Alert xanh + nút "Hoàn tất chiêu mộ"
  - **Dealing (Receiver)**: Alert xanh thông báo chờ owner
  - **Success**: Alert xanh + nút "Vào nhóm chat"
- ✅ `handleMarkAsSuccess()`: Gọi API + tạo group chat + update Firebase status

### 3. Types Updates

#### **CreateTeamStartUpDtoType**
- ✅ Xóa field `status?: string` (backend không nhận)
- ✅ Chỉ giữ `startUpId` và `userId`

#### **PrivateChatRoom**
- ✅ Thêm field `invitationStatus?: string`
- ✅ Thêm field `startupOwnerId?: string`

---

## 🔄 Logic Flow Hoàn chỉnh

### Owner Perspective (SentInvitations Page)

```javascript
// 1. Gửi lời mời (từ findMemberModal)
await TeamStartupService.inviteStartUp(startupId, userId);
// Body: { startUpId, userId } - NO status field

// 2. Xem lời mời đã gửi
const response = await TeamStartupService.getMySentInvitations('Pending');
// API: GET /sent-invites?status=0 (Pending=0, Dealing=1, Success=2, Rejected=3)

// 3. Mở private chat với receiver
await PrivateChatService.getOrCreatePrivateChatRoom(
  currentUser.id,        // Owner
  invitation.userId,     // Receiver
  currentUser.fullName,
  invitation.userFullName,
  currentUser.avatar,
  invitation.userAvatar,
  invitation.id,
  invitation.startUpId,
  invitation.startUpIdea,
  currentUser.id         // startupOwnerId = currentUser
);
// Firebase roomId: private_invitation_{invitationId}_{user1}_{user2}

// 4. Hoàn tất chiêu mộ (sau khi trao đổi xong)
await TeamStartupService.markAsSuccess(invitation.id);
// API: PUT /{id}/confirm-success → Status = Success (2)

await ChatService.getOrCreateChatRoom(
  invitation.startUpId,
  invitation.startUpIdea,
  [currentUser.id, invitation.userId]
);
// Tạo group chat trên Firebase

await PrivateChatService.updateChatRoomInvitationStatus(chatRoomId, 'Success');
// Update Firebase chat room
```

### Receiver Perspective (Invitations Page)

```javascript
// 1. Xem lời mời nhận được
const response = await TeamStartupService.getMyInvitations('Pending');
// API: GET /received-invites?status=0

// 2. Chấp nhận lời mời
const startupResponse = await StartupService.getStartupById(invitation.startUpId);
const startupOwnerId = startupResponse.data.userId;

await TeamStartupService.moveToDealing(invitation.id);
// API: PUT /{id}/accept-invite → Status = Dealing (1)

await PrivateChatService.updateChatRoomInvitationStatus(chatRoomId, 'Dealing');
// Update Firebase chat room (if exists)

// 3. Mở private chat với owner
const chatRoomId = await PrivateChatService.getOrCreatePrivateChatRoom(
  startupOwnerId,           // Owner (from startup)
  currentUser.id,           // Receiver
  startupOwnerName,
  currentUser.fullName,
  '',
  currentUser.avatar,
  invitation.id,
  invitation.startUpId,
  invitation.startUpIdea,
  startupOwnerId
);
// Firebase roomId: private_invitation_{invitationId}_{user1}_{user2}
```

---

## 🔴 Issues & Workarounds

### Issue 1: Backend không trả `startupOwnerId`

**Problem**: 
- `/received-invites` trả về `userId` = receiver ID
- Frontend cần owner ID để tạo chat room đúng

**Current Workaround**:
```javascript
// Fetch startup để lấy ownerId
const startupResponse = await StartupService.getStartupById(invitation.startUpId);
const startupOwnerId = startupResponse.data.userId;
```

**Recommendation**: 
Backend nên bổ sung vào `TeamStartUpDto`:
```csharp
public string StartupOwnerId { get; set; }
public string StartupOwnerName { get; set; }
public string StartupOwnerAvatar { get; set; }
```

### Issue 2: Private Chat Room ID Conflict

**Problem**: 
- Nếu 2 users chat về nhiều startup khác nhau → cùng roomId
- Dẫn đến context invitation bị overwrite

**Solution Implemented**:
```javascript
// Thay đổi từ:
const roomId = `private_${user1}_${user2}`;

// Thành:
const roomId = invitationId 
  ? `private_invitation_${invitationId}_${user1}_${user2}`
  : `private_${user1}_${user2}`;
```

**Result**: Mỗi invitation có chat room riêng biệt.

### Issue 3: Status Type Mismatch

**Problem**: 
- Backend enum: Pending=0, Dealing=1, Success=2, Rejected=3
- Frontend ban đầu gửi string: "Pending", "Dealing", etc.
- API trả 500 error

**Solution**:
```javascript
// Service layer convert string → number
const statusMap = {
  'Pending': 0,
  'Dealing': 1,
  'Success': 2,
  'Rejected': 3
};
params.append('status', statusMap[status]?.toString() || '0');
```

---

## 📦 Firebase Collections Structure

### privateChatRooms
```javascript
{
  id: "private_invitation_123_userid1_userid2",
  participants: ["userid1", "userid2"],
  participantNames: { userid1: "Name1", userid2: "Name2" },
  participantAvatars: { userid1: "url1", userid2: "url2" },
  invitationId: 123,
  invitationStatus: "Dealing",  // Pending, Dealing, Success, Rejected
  startupId: 456,
  startupName: "AI for Education",
  startupOwnerId: "owner-userid",
  lastMessage: "Hello",
  lastMessageTime: Timestamp,
  unreadCount: { userid1: 0, userid2: 3 },
  createdAt: Timestamp
}
```

### privateMessages
```javascript
{
  id: "auto-id",
  chatRoomId: "private_invitation_123_userid1_userid2",
  senderId: "userid1",
  senderName: "Name1",
  senderAvatar: "url1",
  receiverId: "userid2",
  message: "Hello world",
  imageUrl: "",
  fileUrl: "",
  fileName: "",
  createdAt: Timestamp,
  isRead: false
}
```

### chatRooms (Group Chat)
```javascript
{
  id: "group_startupid_456",
  startupId: 456,
  startupName: "AI for Education",
  members: ["ownerid", "memberid1", "memberid2"],
  lastMessage: "Welcome",
  lastMessageTime: Timestamp,
  unreadCount: 5,
  createdAt: Timestamp
}
```

---

## ✨ Key Features

1. **Unique Chat Room per Invitation**: Mỗi invitation có chat room riêng
2. **Owner Context Tracking**: Luôn biết ai là owner qua `startupOwnerId`
3. **Status Sync**: Firebase chat room status sync với backend invitation status
4. **Smart UI**: Hiển thị action buttons phù hợp với role và status
5. **Error Handling**: Graceful fallback khi chat room chưa tồn tại

---

## 🧪 Testing Scenarios

### ✅ Test Case 1: Happy Path
1. Owner gửi invitation → Pending
2. Receiver vào /invitations → thấy invitation
3. Receiver click "Chấp nhận" → Status = Dealing
4. Receiver mở chat → tạo room mới với đúng invitationId
5. Owner và Receiver trao đổi
6. Owner click "Hoàn tất chiêu mộ" → Status = Success
7. Group chat được tạo, member được add

### ✅ Test Case 2: Multiple Invitations
1. Owner A gửi 2 invitations cho User B (startup 1 và startup 2)
2. User B accept cả 2
3. Verify: 2 chat rooms riêng biệt được tạo
4. Verify: Context (startupId, invitationId) đúng cho mỗi room

### ✅ Test Case 3: Status Updates
1. Receiver accept invitation
2. Verify: Firebase room status = "Dealing"
3. Owner confirm success
4. Verify: Firebase room status = "Success"

---

## 📚 Files Modified

### Services
- ✅ `src/service/TeamStartupService.ts`
- ✅ `src/service/PrivateChatService.ts`

### Pages
- ✅ `src/pages/Invitations.tsx`
- ✅ `src/pages/SentInvitations.tsx`
- ✅ `src/components/PrivateChat/PrivateChat.tsx`

### Types
- ✅ `src/types/StartupType.ts`
- ✅ `src/types/PrivateChatType.ts`

### Documentation
- ✅ `BACKEND_API_REQUIREMENTS.md` (NEW)
- ✅ `FRONTEND_IMPLEMENTATION_SUMMARY.md` (THIS FILE)

---

## 🚀 Next Steps

### For Backend Team
1. ✅ Bổ sung `startupOwnerId`, `startupOwnerName` vào `TeamStartUpDto`
2. ✅ Verify status parameter nhận number (0-3) chứ không phải string
3. ✅ Test tất cả endpoints theo document `BACKEND_API_REQUIREMENTS.md`

### For Frontend Team
1. ⏳ Test end-to-end flow với backend API thật
2. ⏳ Handle edge cases: invitation expired, user deleted, etc.
3. ⏳ Add loading states và better error messages
4. ⏳ Optimize Firebase queries với indexes

### For DevOps
1. ⏳ Tạo Firebase composite indexes:
   ```
   Collection: privateMessages
   Fields: chatRoomId (ASC), createdAt (ASC)
   ```

---

**Version**: 1.0  
**Date**: November 23, 2025  
**Status**: Ready for Backend Integration  
**Author**: Frontend Team
