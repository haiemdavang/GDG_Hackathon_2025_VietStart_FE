import {
  Avatar,
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  FileButton,
  ActionIcon,
  Loader,
  Center,
  Box,
  Image,
  Alert
} from '@mantine/core';
import { Send, Paperclip, X, Download, ArrowLeft, CheckCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { RootState } from '../../store/store';
import { PrivateChatService } from '../../service/PrivateChatService';
import { TeamStartupService } from '../../service/TeamStartupService';
import { ChatService } from '../../service/ChatService';
import type { PrivateChatMessage, PrivateChatRoom } from '../../types/PrivateChatType';
import showErrorNotification from '../../Toast/NotificationError';
import showSuccessNotification from '../../Toast/NotificationSuccess';
import { APP_ROUTES } from '../../constant';

export default function PrivateChat() {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [messages, setMessages] = useState<PrivateChatMessage[]>([]);
  const [chatRoom, setChatRoom] = useState<PrivateChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingInvitation, setIsProcessingInvitation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatRoomId || !currentUser) return;

    let unsubscribe: (() => void) | undefined;

    const initChat = async () => {
      try {
        // Load chat room info
        const roomInfo = await PrivateChatService.getChatRoomInfo(chatRoomId);
        setChatRoom(roomInfo);

        // Subscribe to messages
        unsubscribe = PrivateChatService.subscribeToPrivateMessages(chatRoomId, (msgs) => {
          setMessages(msgs);
          setIsLoading(false);
          scrollToBottom();
        });

        // Mark as read
        if (currentUser.id) {
          await PrivateChatService.markPrivateMessagesAsRead(chatRoomId, currentUser.id);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        showErrorNotification('Lỗi', 'Không thể tải tin nhắn');
        setIsLoading(false);
      }
    };

    initChat();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [chatRoomId, currentUser]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getOtherUser = () => {
    if (!chatRoom || !currentUser) return null;
    const otherUserId = chatRoom.participants.find(id => id !== currentUser.id);
    
    // If both participants are the same user (error case), use startup info
    if (!otherUserId) {
      return {
        id: chatRoom.participants[0] || 'unknown',
        name: chatRoom.startupName || 'Người dùng không xác định',
        avatar: ''
      };
    }

    return {
      id: otherUserId,
      name: chatRoom.participantNames[otherUserId] || 'Người dùng',
      avatar: chatRoom.participantAvatars[otherUserId] || ''
    };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !file) return;
    if (!currentUser?.id || !chatRoom || !chatRoomId) return;

    const otherUser = getOtherUser();
    if (!otherUser) return;

    setIsSending(true);
    try {
      if (file) {
        await PrivateChatService.sendPrivateMessageWithFile(
          chatRoomId,
          currentUser.id,
          currentUser.fullName,
          otherUser.id,
          newMessage,
          file,
          currentUser.avatar
        );
      } else {
        await PrivateChatService.sendPrivateMessage(
          chatRoomId,
          currentUser.id,
          currentUser.fullName,
          otherUser.id,
          newMessage,
          currentUser.avatar
        );
      }

      setNewMessage('');
      setFile(null);
      scrollToBottom();
    } catch (error: any) {
      showErrorNotification('Lỗi', error.message || 'Không thể gửi tin nhắn');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMarkAsSuccess = async () => {
    if (!chatRoom?.invitationId || !currentUser?.id) return;

    setIsProcessingInvitation(true);
    try {
      // Chủ startup hoàn tất chiêu mộ
      await TeamStartupService.markAsSuccess(chatRoom.invitationId);
      
      // Thêm receiver vào group chat (tự động tạo nếu chưa có)
      const otherUser = getOtherUser();
      if (otherUser && chatRoom.startupId) {
        await ChatService.addMemberToRoom(
          chatRoom.startupId,
          otherUser.id,
          chatRoom.startupName,
          currentUser.id
        );
      }

      showSuccessNotification('Thành công', 'Đã hoàn tất chiêu mộ và thêm vào nhóm chat!');
      
      // Reload chat room info
      const updatedRoom = await PrivateChatService.getChatRoomInfo(chatRoomId!);
      setChatRoom(updatedRoom);
    } catch (error: any) {
      showErrorNotification('Lỗi', error.message || 'Không thể hoàn tất chiêu mộ');
    } finally {
      setIsProcessingInvitation(false);
    }
  };


  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  const otherUser = getOtherUser();
  if (!otherUser || !chatRoom) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Text c="dimmed">Không tìm thấy thông tin phòng chat</Text>
          <Button onClick={() => navigate(-1)} variant="light">
            Quay lại
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Paper shadow="sm" radius="md" h="100vh" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Group p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
        <ActionIcon
          size="lg"
          variant="subtle"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </ActionIcon>
        <Avatar src={otherUser.avatar} size="md" radius="xl">
          {otherUser.name[0]}
        </Avatar>
        <Box style={{ flex: 1 }}>
          <Text fw={600} size="lg">{otherUser.name}</Text>
          {chatRoom?.startupName && (
            <Text size="sm" c="dimmed">
              Startup: {chatRoom.startupName}
            </Text>
          )}
        </Box>
        {/* {chatRoom?.startupId && (
          <Button
            variant="light"
            size="sm"
            onClick={() => navigate(APP_ROUTES.CHAT_ROOM(chatRoom.startupId!))}
          >
            Vào nhóm chat
          </Button>
        )} */}
      </Group>

      {/* Invitation Alert - Receiver View (Pending) */}
      {/* {chatRoom?.invitationId && chatRoom?.invitationStatus === 'Pending' && chatRoom?.startupOwnerId !== currentUser?.id && (
        <Alert color="yellow" p="md" style={{ borderRadius: 0 }}>
          <Group justify="space-between">
            <Text size="sm">
              Lời mời tham gia startup: <strong>{chatRoom.startupName}</strong>
            </Text>
            <Group gap="xs">
              <Button
                leftSection={<Check size={16} />}
                size="xs"
                color="green"
                onClick={handleAcceptInvitation}
                loading={isProcessingInvitation}
              >
                Chấp nhận
              </Button>
              <Button
                leftSection={<XIcon size={16} />}
                size="xs"
                color="red"
                variant="outline"
                onClick={handleRejectInvitation}
                loading={isProcessingInvitation}
              >
                Từ chối
              </Button>
            </Group>
          </Group>
        </Alert>
      )} */}

      {/* Dealing Status - Owner View */}
      {chatRoom?.invitationId && chatRoom?.invitationStatus === 'Dealing' && chatRoom?.startupOwnerId === currentUser?.id && (
        <Alert color="blue" p="md" style={{ borderRadius: 0 }}>
          <Group justify="space-between" align="center">
            <Text size="sm">
              Đang trao đổi với ứng viên. Sau khi thỏa thuận xong, hãy hoàn tất chiêu mộ.
            </Text>
            <Button
              leftSection={<CheckCircle size={16} />}
              size="xs"
              color="green"
              onClick={handleMarkAsSuccess}
              loading={isProcessingInvitation}
            >
              Hoàn tất chiêu mộ
            </Button>
          </Group>
        </Alert>
      )}

      {/* Dealing Status - Receiver View */}
      {chatRoom?.invitationId && chatRoom?.invitationStatus === 'Dealing' && chatRoom?.startupOwnerId !== currentUser?.id && (
        <Alert color="blue" p="md" style={{ borderRadius: 0 }}>
          <Text size="sm">
            Đang trao đổi với chủ startup. Vui lòng chờ chủ startup hoàn tất chiêu mộ.
          </Text>
        </Alert>
      )}

      {/* Success Status */}
      {chatRoom?.invitationId && chatRoom?.invitationStatus === 'Success' && (
        <Alert color="green" p="md" style={{ borderRadius: 0 }}>
          <Group justify="space-between" align="center">
            <Text size="sm">
              <strong>Thành công!</strong> Bạn đã là thành viên của startup {chatRoom.startupName}
            </Text>
            {chatRoom?.startupId && (
              <Button
                size="xs"
                variant="light"
                onClick={() => navigate(APP_ROUTES.CHAT_ROOM(chatRoom.startupId!))}
              >
                Vào nhóm chat
              </Button>
            )}
          </Group>
        </Alert>
      )}

      {/* Messages */}
      <ScrollArea style={{ flex: 1 }} p="md">
        <Stack gap="md">
          {messages.length === 0 ? (
            <Center h="100%">
              <Text c="dimmed">Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!</Text>
            </Center>
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.senderId === currentUser?.id;

              return (
                <Group
                  key={msg.id}
                  align="flex-start"
                  justify={isCurrentUser ? 'flex-end' : 'flex-start'}
                  wrap="nowrap"
                >
                  {!isCurrentUser && (
                    <Avatar src={msg.senderAvatar} size="sm" radius="xl">
                      {msg.senderName[0]}
                    </Avatar>
                  )}

                  <Stack gap={4} style={{ maxWidth: '70%' }}>
                    {!isCurrentUser && (
                      <Text size="xs" c="dimmed" pl="xs">{msg.senderName}</Text>
                    )}

                    <Paper
                      p="sm"
                      bg={isCurrentUser ? 'blue.6' : 'gray.1'}
                      style={{
                        borderRadius: 12,
                        color: isCurrentUser ? 'white' : 'black',
                        wordBreak: 'break-word'
                      }}
                    >
                      {msg.message && <Text size="sm">{msg.message}</Text>}

                      {msg.imageUrl && (
                        <Image
                          src={msg.imageUrl}
                          alt="attachment"
                          radius="md"
                          mt={msg.message ? 'xs' : 0}
                          style={{ maxWidth: '100%', maxHeight: 300 }}
                        />
                      )}

                      {msg.fileUrl && !msg.imageUrl && (
                        <Group gap="xs" mt={msg.message ? 'xs' : 0}>
                          <Paperclip size={16} />
                          <Text
                            size="sm"
                            component="a"
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: 'inherit',
                              textDecoration: 'underline',
                              flex: 1
                            }}
                          >
                            {msg.fileName}
                          </Text>
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            component="a"
                            href={msg.fileUrl}
                            download={msg.fileName}
                          >
                            <Download size={14} />
                          </ActionIcon>
                        </Group>
                      )}
                    </Paper>

                    <Text size="xs" c="dimmed" pl="xs">
                      {formatTime(msg.createdAt)}
                      {msg.isRead && isCurrentUser && ' • Đã xem'}
                    </Text>
                  </Stack>

                  {isCurrentUser && (
                    <Avatar src={msg.senderAvatar} size="sm" radius="xl">
                      {msg.senderName[0]}
                    </Avatar>
                  )}
                </Group>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Stack>
      </ScrollArea>

      {/* Input Area */}
      <Box p="md" style={{ borderTop: '1px solid #e9ecef' }}>
        {file && (
          <Group
            gap="xs"
            mb="xs"
            p="xs"
            style={{
              backgroundColor: '#f8f9fa',
              borderRadius: 8
            }}
          >
            <Paperclip size={16} />
            <Text size="sm" style={{ flex: 1 }} truncate>
              {file.name}
            </Text>
            <ActionIcon
              size="sm"
              color="red"
              variant="subtle"
              onClick={() => setFile(null)}
            >
              <X size={16} />
            </ActionIcon>
          </Group>
        )}

        <Group align="flex-end" wrap="nowrap">
          <FileButton
            onChange={setFile}
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
          >
            {(props) => (
              <ActionIcon {...props} size="lg" variant="light" color="gray">
                <Paperclip size={20} />
              </ActionIcon>
            )}
          </FileButton>

          <Textarea
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            minRows={1}
            maxRows={4}
            autosize
            style={{ flex: 1 }}
            disabled={isSending}
          />

          <Button
            onClick={handleSendMessage}
            loading={isSending}
            disabled={(!newMessage.trim() && !file) || isSending}
            leftSection={<Send size={18} />}
          >
            Gửi
          </Button>
        </Group>
      </Box>
    </Paper>
  );
}
