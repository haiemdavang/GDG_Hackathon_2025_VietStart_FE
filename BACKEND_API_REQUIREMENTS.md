# Backend API Requirements - VietStart Chat & Invitation System

## 📋 Tổng quan

Document này mô tả chi tiết các API endpoint cần thiết cho hệ thống Chat và Chiêu mộ thành viên của VietStart Frontend.

---

## 🔄 Flow hoàn chỉnh

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVITATION WORKFLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. OWNER gửi lời mời
   POST /api/TeamStartUps/invite
   Body: { startUpId: number, userId: string }
   → Status = Pending (0)

2. RECEIVER xem lời mời nhận được
   GET /api/TeamStartUps/received-invites?status=0
   → Trả về danh sách invitation với status Pending

3. RECEIVER chấp nhận lời mời
   PUT /api/TeamStartUps/{id}/accept-invite
   → Status = Dealing (1)
   → Bắt đầu chat riêng 1-1 trên Firebase

4. OWNER và RECEIVER trao đổi qua private chat
   (Firebase Firestore: privateChatRooms & privateMessages)

5. OWNER hoàn tất chiêu mộ
   PUT /api/TeamStartUps/{id}/confirm-success
   → Status = Success (2)
   → Backend tự động thêm member vào group chat (Firebase)
   → Frontend tạo group chat room trên Firebase

6. Các trường hợp khác:
   - RECEIVER từ chối: PUT /api/TeamStartUps/{id}/reject-invite → Rejected (3)
   - OWNER hủy Pending: DELETE /api/TeamStartUps/{id}/cancel-invite
   - OWNER hủy Dealing: PUT /api/TeamStartUps/{id}/cancel-dealing → Rejected (3)
```

---

## 📊 Status Enum

```csharp
public enum TeamStartUpStatus
{
    Pending = 0,   // Đang chờ phản hồi
    Dealing = 1,   // Đang trao đổi
    Success = 2,   // Thành công (đã là member)
    Rejected = 3   // Bị từ chối hoặc hủy
}
```

---

## 🎯 API Endpoints - Chi tiết

### 1. POST /api/TeamStartUps/invite
**Mô tả**: Owner gửi lời mời chiêu mộ cho user

**Request Body**:
```json
{
  "startUpId": 123,
  "userId": "f45d2836-b604-4ba5-ad4a-ac63bcaa2aa8"
}
```

**Response Success (200)**:
```json
{
  "message": "Gửi lời mời chiêu mộ thành công"
}
```

**Validation**:
- ✅ StartUp phải tồn tại
- ✅ User phải tồn tại
- ✅ Owner phải là chủ của StartUp
- ✅ Không được gửi duplicate (kiểm tra status: Pending, Dealing, Success)
- ✅ Backend tự set Status = Pending (0)

**Error Responses**:
- 400: "StartUp không tồn tại"
- 400: "User không tồn tại"
- 400: "Đã có lời mời đang chờ xử lý"
- 400: "Đang trong quá trình trao đổi với user này"
- 400: "User đã là thành viên của startup này"
- 403: Unauthorized (không phải owner)

---

### 2. GET /api/TeamStartUps/sent-invites
**Mô tả**: Lấy danh sách lời mời đã gửi (owner view)

**Query Parameters**:
- `startUpId` (optional): number - Filter theo startup cụ thể
- `status` (optional): number (0-3) - Filter theo status

**⚠️ LƯU Ý QUAN TRỌNG**: 
- Frontend sẽ gửi status dạng **NUMBER (0, 1, 2, 3)** chứ KHÔNG PHẢI string
- Mapping: Pending=0, Dealing=1, Success=2, Rejected=3

**Example Request**:
```
GET /api/TeamStartUps/sent-invites?status=1
```

**Response Success (200)**:
```json
{
  "data": [
    {
      "id": 456,
      "startUpId": 123,
      "startUpIdea": "AI for Education",
      "userId": "f45d2836-b604-4ba5-ad4a-ac63bcaa2aa8",
      "userFullName": "Nguyễn Văn A",
      "userAvatar": "https://...",
      "status": 1
    }
  ],
  "total": 1
}
```

**⚠️ THIẾU FIELD QUAN TRỌNG**: 
Backend CẦN thêm field `startupOwnerId` hoặc `ownerUserId` để frontend biết ai là owner!

**Validation**:
- ✅ Chỉ trả về invitations của các startup mà currentUser là owner
- ✅ Nếu có startUpId, verify owner trước khi trả data

---

### 3. GET /api/TeamStartUps/received-invites
**Mô tả**: Lấy danh sách lời mời nhận được (receiver view)

**Query Parameters**:
- `status` (optional): number (0-3) - Filter theo status

**⚠️ LƯU Ý QUAN TRỌNG**: 
- Frontend sẽ gửi status dạng **NUMBER (0, 1, 2, 3)**

**Example Request**:
```
GET /api/TeamStartUps/received-invites?status=0
```

**Response Success (200)**:
```json
{
  "data": [
    {
      "id": 456,
      "startUpId": 123,
      "startUpIdea": "AI for Education",
      "userId": "f45d2836-b604-4ba5-ad4a-ac63bcaa2aa8",
      "userFullName": "Nguyễn Văn A",
      "userAvatar": "https://...",
      "status": 0,
      "startupOwnerId": "owner-uuid-here",  // 🔴 CẦN BỔ SUNG
      "startupOwnerName": "Nguyễn Văn B"    // 🔴 CẦN BỔ SUNG
    }
  ],
  "total": 1
}
```

**🔴 YÊU CẦU BỔ SUNG**:
Backend PHẢI thêm 2 field:
- `startupOwnerId`: string - User ID của chủ startup
- `startupOwnerName`: string - Tên đầy đủ của chủ startup

**Lý do**: Frontend cần biết owner để tạo private chat room đúng giữa owner và receiver.

**Validation**:
- ✅ Chỉ trả về invitations mà userId = currentUser.Id
- ✅ Sắp xếp theo createdAt DESC

---

### 4. PUT /api/TeamStartUps/{id}/accept-invite
**Mô tả**: Receiver chấp nhận lời mời → chuyển sang Dealing

**URL Parameter**:
- `id`: number - Invitation ID

**Response Success (200)**:
```json
{
  "message": "Đã chấp nhận lời mời. Bây giờ bạn có thể nhắn tin trao đổi với chủ startup",
  "status": 1
}
```

**Logic Backend**:
1. ✅ Verify invitation tồn tại
2. ✅ Verify currentUser là người được mời (userId)
3. ✅ Verify status = Pending (0)
4. ✅ Update status = Dealing (1)
5. ✅ Save to database

**Error Responses**:
- 400: "Lời mời này không ở trạng thái chờ xử lý"
- 403: Unauthorized (không phải receiver)
- 404: "Lời mời không tồn tại"

---

### 5. PUT /api/TeamStartUps/{id}/reject-invite
**Mô tả**: Receiver từ chối lời mời

**URL Parameter**:
- `id`: number - Invitation ID

**Request Body (optional)**:
```json
{
  "reason": "Không phù hợp với lịch trình"
}
```

**Response Success (200)**:
```json
{
  "message": "Đã từ chối lời mời",
  "reason": "Không phù hợp với lịch trình",
  "status": 3
}
```

**Validation**:
- ✅ Verify currentUser là receiver
- ✅ Verify status = Pending (0)
- ✅ Update status = Rejected (3)

---

### 6. PUT /api/TeamStartUps/{id}/confirm-success
**Mô tả**: Owner xác nhận thành công → thêm member vào group

**URL Parameter**:
- `id`: number - Invitation ID

**Response Success (200)**:
```json
{
  "message": "Đã xác nhận thành công. Thành viên đã được thêm vào nhóm chat",
  "status": 2
}
```

**Logic Backend**:
1. ✅ Verify invitation tồn tại
2. ✅ Verify currentUser là owner của startup
3. ✅ Verify status = Dealing (1)
4. ✅ Update status = Success (2)
5. ✅ Save to database

**🔴 TODO Backend**: 
- Có thể thêm logic notify member qua email/notification
- Frontend sẽ tự tạo group chat room trên Firebase

**Error Responses**:
- 400: "Chỉ có thể xác nhận thành công khi đang ở trạng thái Dealing"
- 403: Unauthorized (không phải owner)
- 404: "Lời mời không tồn tại"

---

### 7. PUT /api/TeamStartUps/{id}/cancel-dealing
**Mô tả**: Owner hủy bỏ quá trình trao đổi

**URL Parameter**:
- `id`: number - Invitation ID

**Request Body (optional)**:
```json
{
  "reason": "Không phù hợp sau khi trao đổi"
}
```

**Response Success (200)**:
```json
{
  "message": "Đã hủy bỏ quá trình trao đổi",
  "reason": "Không phù hợp sau khi trao đổi",
  "status": 3
}
```

**Validation**:
- ✅ Verify currentUser là owner
- ✅ Verify status = Dealing (1)
- ✅ Update status = Rejected (3)

---

### 8. DELETE /api/TeamStartUps/{id}/cancel-invite
**Mô tả**: Owner hủy lời mời (chỉ khi Pending)

**URL Parameter**:
- `id`: number - Invitation ID

**Response Success (200)**:
```json
{
  "message": "Đã hủy lời mời"
}
```

**Validation**:
- ✅ Verify currentUser là owner
- ✅ Verify status = Pending (0)
- ✅ DELETE record hoặc soft delete

**Error Responses**:
- 400: "Chỉ có thể hủy lời mời khi còn ở trạng thái Pending"
- 403: Unauthorized

---

### 9. DELETE /api/TeamStartUps/{id}/remove-member
**Mô tả**: Owner xóa thành viên khỏi startup

**URL Parameter**:
- `id`: number - TeamStartUp ID (status = Success)

**Response Success (200)**:
```json
{
  "message": "Đã xóa thành viên khỏi startup"
}
```

**Logic Backend**:
1. ✅ Verify currentUser là owner
2. ✅ DELETE hoặc soft delete
3. 🔴 TODO: Remove user khỏi Firebase group chat (hoặc để frontend làm)

---

### 10. GET /api/TeamStartUps/dealing-chats
**Mô tả**: Lấy danh sách các invitation đang Dealing (cả owner và receiver)

**Response Success (200)**:
```json
{
  "data": [
    {
      "id": 456,
      "startUpId": 123,
      "startUpIdea": "AI for Education",
      "userId": "receiver-id",
      "userFullName": "Nguyễn Văn A",
      "userAvatar": "https://...",
      "status": 1,
      "startupOwnerId": "owner-id",     // 🔴 CẦN BỔ SUNG
      "startupOwnerName": "Nguyễn Văn B" // 🔴 CẦN BỔ SUNG
    }
  ],
  "total": 1
}
```

**Logic Backend**:
1. ✅ Lấy các startup của currentUser (owner)
2. ✅ Lấy các invitation mà currentUser là receiver
3. ✅ Filter status = Dealing (1)
4. ✅ Combine và return

---

### 11. GET /api/TeamStartUps/my-team-members
**Mô tả**: Lấy danh sách thành viên Success của startup

**Query Parameters**:
- `startUpId` (optional): number

**Response Success (200)**:
```json
{
  "data": [
    {
      "id": 456,
      "startUpId": 123,
      "startUpIdea": "AI for Education",
      "userId": "member-id",
      "userFullName": "Nguyễn Văn A",
      "userAvatar": "https://...",
      "status": 2
    }
  ],
  "total": 1
}
```

**Validation**:
- ✅ Verify currentUser là owner
- ✅ Filter status = Success (2)

---

## 🔥 YÊU CẦU QUAN TRỌNG

### 1. DTO Updates Cần Thiết

**TeamStartUpDto cần bổ sung**:
```csharp
public class TeamStartUpDto
{
    public int Id { get; set; }
    public int StartUpId { get; set; }
    public string StartUpIdea { get; set; }
    public string UserId { get; set; }
    public string UserFullName { get; set; }
    public string UserAvatar { get; set; }
    public TeamStartUpStatus Status { get; set; }
    
    // 🔴 CẦN BỔ SUNG
    public string StartupOwnerId { get; set; }    // User ID của chủ startup
    public string StartupOwnerName { get; set; }  // Tên chủ startup
    public string StartupOwnerAvatar { get; set; } // Avatar chủ startup
}
```

**Lý do**: Frontend cần biết owner để:
- Tạo private chat room đúng
- Hiển thị thông tin owner trong UI
- Phân biệt role (owner vs receiver)

### 2. Status Parameter - PHẢI LÀ NUMBER

❌ **SAI**:
```
GET /api/TeamStartUps/sent-invites?status=Pending
GET /api/TeamStartUps/sent-invites?status=Dealing
```

✅ **ĐÚNG**:
```
GET /api/TeamStartUps/sent-invites?status=0  // Pending
GET /api/TeamStartUps/sent-invites?status=1  // Dealing
GET /api/TeamStartUps/sent-invites?status=2  // Success
GET /api/TeamStartUps/sent-invites?status=3  // Rejected
```

**Backend Controller**:
```csharp
[HttpGet("sent-invites")]
public async Task<ActionResult<IEnumerable<TeamStartUpDto>>> GetSentInvites(
    [FromQuery] int? startUpId = null,
    [FromQuery] TeamStartUpStatus? status = null)  // ✅ Dùng enum trực tiếp
{
    // ... logic
}
```

### 3. Security & Validation

Tất cả endpoints PHẢI:
- ✅ Verify JWT token
- ✅ Check role Authorization
- ✅ Validate ownership (owner/receiver)
- ✅ Return proper error codes (400, 403, 404, 500)
- ✅ Log errors để debug

### 4. Response Format Chuẩn

**Success**:
```json
{
  "data": [...],
  "total": 10,
  "message": "Success" // optional
}
```

**Error**:
```json
{
  "message": "Descriptive error message",
  "errors": [...] // optional validation errors
}
```

---

## 🎨 Frontend Integration

### Private Chat Room ID Format

Frontend tạo unique ID cho mỗi invitation:
```javascript
const roomId = invitationId 
  ? `private_invitation_${invitationId}_${userId1}_${userId2}`
  : `private_${userId1}_${userId2}`;
```

**Lưu ý**: userId1 và userId2 được sort alphabetically để đảm bảo consistency.

### Firebase Collections Structure

**privateChatRooms**:
```javascript
{
  id: "private_invitation_123_user1_user2",
  participants: ["user1", "user2"],
  participantNames: { user1: "Name 1", user2: "Name 2" },
  participantAvatars: { user1: "url", user2: "url" },
  invitationId: 123,
  invitationStatus: "Dealing", // Pending, Dealing, Success, Rejected
  startupId: 456,
  startupName: "AI for Education",
  startupOwnerId: "owner-user-id",
  lastMessage: "Hello",
  lastMessageTime: Timestamp,
  unreadCount: { user1: 0, user2: 5 },
  createdAt: Timestamp
}
```

**privateMessages**:
```javascript
{
  id: "auto-generated",
  chatRoomId: "private_invitation_123_user1_user2",
  senderId: "user1",
  senderName: "Name 1",
  senderAvatar: "url",
  receiverId: "user2",
  message: "Hello",
  imageUrl: "",
  fileUrl: "",
  fileName: "",
  createdAt: Timestamp,
  isRead: false
}
```

---

## 🧪 Testing Checklist

### Scenario 1: Happy Path
1. ✅ Owner gửi invitation → Status = Pending
2. ✅ Receiver xem /received-invites → Thấy invitation
3. ✅ Receiver accept → Status = Dealing
4. ✅ Cả 2 chat trên Firebase
5. ✅ Owner confirm success → Status = Success
6. ✅ Member được add vào group chat

### Scenario 2: Rejection Path
1. ✅ Owner gửi invitation → Pending
2. ✅ Receiver reject → Rejected
3. ✅ Owner không thấy trong /sent-invites?status=1

### Scenario 3: Owner Cancel
1. ✅ Owner gửi invitation → Pending
2. ✅ Owner cancel-invite → Deleted
3. ✅ Receiver không thấy trong /received-invites

### Scenario 4: Edge Cases
1. ✅ Gửi duplicate invitation → 400 error
2. ✅ User không tồn tại → 400 error
3. ✅ Accept invitation của người khác → 403 error
4. ✅ Confirm success khi status = Pending → 400 error

---

## 📞 Support & Questions

Nếu cần clarification về bất kỳ endpoint nào, vui lòng liên hệ frontend team.

**Key Points**:
- Status PHẢI là number (0-3)
- DTO PHẢI có startupOwnerId và startupOwnerName
- Validation PHẢI strict về ownership
- Error messages PHẢI descriptive và helpful

---

**Document Version**: 1.0  
**Last Updated**: November 23, 2025  
**Author**: Frontend Team - VietStart
