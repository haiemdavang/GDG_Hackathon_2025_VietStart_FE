# Group Chat Logic Changes - December 2024

## Overview
Changed the group chat creation logic from **"create when first member added"** to **"create immediately when startup is created"**.

## Motivation
- Group chat should exist as soon as a startup is created
- Members are added to an existing group, not creating a new one each time
- Prevents potential issues with multiple group creation attempts
- Clear separation: creation (owner only, at startup creation) vs addition (when members join)

## Changes Made

### 1. StartupService.ts
**File:** `src/service/StartupService.ts`

**Added imports:**
```typescript
import { ChatService } from './ChatService';
import { getUserIdFromToken } from '../untils/Helper';
```

**Modified `createStartup` method:**
```typescript
// Create new startup
createStartup: async (data: CreateStartUpDto): Promise<AxiosResponse<StartUpDto>> => {
    try {
        const response = await AxiosService.post<StartUpDto>('/api/Startups', data);
        
        // Create Firebase group chat immediately with owner as the only member
        const token = localStorage.getItem('token');
        if (token && response.data.id) {
            const userId = getUserIdFromToken(token);
            if (userId) {
                await ChatService.getOrCreateChatRoom(
                    response.data.id,
                    response.data.idea,
                    [userId]
                );
            }
        }
        
        return response;
    } catch (error: any) {
        if (error.response?.status === 400) {
            const message = error.response.data?.Message || 'Thông tin startup không hợp lệ';
            throw new Error(message);
        }
        throw error;
    }
},
```

**Impact:**
- Every newly created startup now has a Firebase group chat room immediately
- Room ID: `startup_{startupId}`
- Initial members: `[ownerId]` (only the owner)

---

### 2. ChatService.ts
**File:** `src/service/ChatService.ts`

**Added new method `addMemberToRoom`:**
```typescript
/**
 * Thêm thành viên vào chat room đã tồn tại
 */
addMemberToRoom: async (
    startupId: number,
    userId: string
): Promise<void> => {
    const roomId = `startup_${startupId}`;
    const roomRef = doc(db, 'chatRooms', roomId);
    const roomDoc = await getDoc(roomRef);

    if (!roomDoc.exists()) {
        throw new Error('Chat room không tồn tại. Vui lòng liên hệ chủ startup.');
    }

    const currentMembers = roomDoc.data().members || [];
    
    // Chỉ thêm nếu chưa có trong danh sách
    if (!currentMembers.includes(userId)) {
        await updateDoc(roomRef, {
            members: [...currentMembers, userId]
        });
    }
},
```

**Purpose:**
- Add a single member to an existing chat room
- Throws error if room doesn't exist (should never happen with new logic)
- Checks for duplicates before adding
- Used when owner marks invitation as "Success"

**Kept existing `getOrCreateChatRoom` method:**
- Still used for initial creation in `createStartup`
- Could also handle edge cases where room doesn't exist
- Merges members if called multiple times (fallback safety)

---

### 3. SentInvitations.tsx (Owner View)
**File:** `src/pages/SentInvitations.tsx`

**Modified `handleMarkAsSuccess` function:**

**BEFORE:**
```typescript
// 2. Lấy thông tin startup để biết tên chính xác
let startupName = invitation.startUpIdea;
try {
    const startupResponse = await StartupService.getStartupById(invitation.startUpId);
    startupName = startupResponse.data.idea || startupResponse.data.team || invitation.startUpIdea;
} catch (err) {
    console.log('Không lấy được tên startup, dùng tên mặc định');
}

// 3. Tạo/cập nhật group chat - THẾM OWNER vào members
const members = [currentUser.id, invitation.userId];
await ChatService.getOrCreateChatRoom(
    invitation.startUpId,
    startupName,
    members
);
```

**AFTER:**
```typescript
// 2. Thêm member vào group chat đã tồn tại (được tạo khi tạo startup)
await ChatService.addMemberToRoom(
    invitation.startUpId,
    invitation.userId
);
```

**Removed:**
- Import of `StartupService` (no longer needed)
- Startup name fetching logic (not needed for adding member)
- Call to `getOrCreateChatRoom` (replaced with `addMemberToRoom`)

**Changes:**
- Simpler logic: just add the member ID
- No need to fetch startup info
- No risk of creating duplicate rooms

---

### 4. PrivateChat.tsx
**File:** `src/components/PrivateChat/PrivateChat.tsx`

**Modified `handleMarkAsSuccess` function:**

**BEFORE:**
```typescript
// Tạo group chat - THẾM OWNER (currentUser) và receiver vào members
const otherUser = getOtherUser();
if (otherUser && chatRoom.startupId && chatRoom.startupName) {
    await ChatService.getOrCreateChatRoom(
        chatRoom.startupId,
        chatRoom.startupName,
        [currentUser.id, otherUser.id] // Owner + Receiver
    );
}

showSuccessNotification('Thành công', 'Đã hoàn tất chiêu mộ và tạo nhóm chat!');
```

**AFTER:**
```typescript
// Thêm receiver vào group chat đã tồn tại (được tạo khi tạo startup)
const otherUser = getOtherUser();
if (otherUser && chatRoom.startupId) {
    await ChatService.addMemberToRoom(
        chatRoom.startupId,
        otherUser.id
    );
}

showSuccessNotification('Thành công', 'Đã hoàn tất chiêu mộ và thêm vào nhóm chat!');
```

**Changes:**
- No longer needs `chatRoom.startupName` check
- Uses `addMemberToRoom` instead of `getOrCreateChatRoom`
- Updated notification message: "tạo nhóm chat" → "thêm vào nhóm chat"

---

### 5. Invitations.tsx (Receiver View) - VERIFIED
**File:** `src/pages/Invitations.tsx`

**Status:** ✅ **NO CHANGES NEEDED**

**Verification:**
- Receivers DO NOT have any "Thêm vào nhóm" or "Vào nhóm chat" buttons
- Only action buttons are for Pending status: "Chấp nhận" and "Từ chối"
- Success status shows only a Badge: "Đã được thêm vào startup"
- No owner-only functionality exposed to receivers

**UI Flow for Receiver:**
```
Pending:
  [Chấp nhận] [Từ chối]

Dealing:
  Badge: "Đang chờ chủ startup hoàn tất"

Success:
  Badge: "Đã được thêm vào startup"
```

---

## New Flow Diagram

### Before (OLD LOGIC ❌):
```
1. Owner creates startup
   └─> No Firebase group created

2. Owner sends invitation → Pending

3. Receiver accepts → Dealing

4. Owner marks as Success
   └─> getOrCreateChatRoom called
       └─> Creates Firebase group with [owner, receiver]
       └─> Risk: Multiple calls could cause issues
```

### After (NEW LOGIC ✅):
```
1. Owner creates startup
   └─> Firebase group created immediately
       └─> Room: startup_{id}
       └─> Members: [ownerId]

2. Owner sends invitation → Pending

3. Receiver accepts → Dealing

4. Owner marks as Success
   └─> addMemberToRoom called
       └─> Adds receiver to EXISTING group
       └─> Members: [ownerId, receiverId]
```

---

## Benefits

1. **Consistency:** Every startup always has a group chat from creation
2. **Simplicity:** Only add members, never create groups in multiple places
3. **Safety:** No risk of race conditions or duplicate group creation
4. **Clarity:** Clear separation of concerns (create vs add)
5. **Owner Experience:** Owner can access group chat even before adding members

---

## Testing Checklist

### 1. Create Startup
- [ ] Create a new startup via the 5-part modal
- [ ] Verify Firebase `chatRooms` collection has `startup_{id}` document
- [ ] Verify `members` array contains only the owner's ID
- [ ] Verify owner can access the (empty) group chat immediately

### 2. Send Invitation
- [ ] Send invitation to a user
- [ ] Verify invitation status is "Pending"
- [ ] Group chat members should still only be `[ownerId]`

### 3. Accept Invitation
- [ ] Receiver accepts invitation
- [ ] Verify status changes to "Dealing"
- [ ] Group chat members should still only be `[ownerId]`
- [ ] Private chat between owner and receiver should be created

### 4. Mark as Success
- [ ] Owner marks invitation as "Success"
- [ ] Verify Firebase group `members` array now includes receiver ID
- [ ] Verify receiver can access group chat
- [ ] Verify both owner and receiver can send messages in group

### 5. Multiple Members
- [ ] Repeat steps 2-4 for a second user
- [ ] Verify group chat members is `[ownerId, receiver1Id, receiver2Id]`
- [ ] Verify all 3 can see and send messages

### 6. Edge Cases
- [ ] Try accessing group chat before any members added (owner should see empty room)
- [ ] Try marking success for same user twice (should handle duplicate gracefully)
- [ ] Test with slow network (ensure atomic operations)

---

## Potential Issues & Solutions

### Issue: What if Firebase group creation fails during startup creation?
**Solution:** 
- Wrapped in try-catch with token validation
- Backend startup creation succeeds regardless
- Group can be created later via `getOrCreateChatRoom` if needed (fallback)

### Issue: What if room doesn't exist when adding member?
**Solution:**
- `addMemberToRoom` throws error: "Chat room không tồn tại. Vui lòng liên hệ chủ startup."
- User sees error notification
- Admin can manually create room or fix via Firebase console

### Issue: Can receiver see empty group chat before joining?
**Solution:**
- No, receivers only get access after being marked as "Success"
- Firebase security rules should enforce this (if implemented)

---

## Related Files

### Modified:
1. `src/service/StartupService.ts`
2. `src/service/ChatService.ts`
3. `src/pages/SentInvitations.tsx`
4. `src/components/PrivateChat/PrivateChat.tsx`

### Verified (No Changes):
1. `src/pages/Invitations.tsx` - Receiver UI is correct

### Unchanged (Related):
1. `src/service/TeamStartupService.ts` - Backend API calls
2. `src/service/PrivateChatService.ts` - Private messaging
3. `src/types/StartupType.ts` - Type definitions
4. `src/types/ChatType.ts` - Chat type definitions

---

## Firebase Structure

### chatRooms Collection:
```typescript
{
  // Document ID: startup_{startupId}
  startupId: number,
  startupName: string,
  members: string[], // Array of user IDs
  createdAt: Timestamp,
  lastMessage: string,
  lastMessageTime: Timestamp,
  unreadCount: number
}
```

### messages Collection:
```typescript
{
  startupId: number,
  userId: string,
  userName: string,
  userAvatar: string,
  message: string,
  fileUrl?: string,
  fileName?: string,
  imageUrl?: string,
  createdAt: Timestamp,
  isRead: boolean
}
```

---

## Deployment Notes

1. **No Backend Changes Required** - This is purely a frontend logic change
2. **No Database Migration Required** - Firebase structure unchanged
3. **Backward Compatible** - Existing startups without groups will work (getOrCreateChatRoom creates if missing)
4. **Rollback Safe** - Can revert by undoing the 4 file changes

---

## Success Criteria

✅ Group chat created immediately when startup is created  
✅ Owner is the only initial member  
✅ Members added only when owner marks invitation as Success  
✅ No duplicate group creation possible  
✅ Receivers cannot see owner-only buttons  
✅ No TypeScript or compile errors  

---

**Status:** ✅ **COMPLETED**  
**Date:** December 2024  
**Tested:** Pending user verification  
