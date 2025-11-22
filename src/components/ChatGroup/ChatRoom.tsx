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
  Image
} from '@mantine/core';
import { Send, Paperclip, X, Download } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { ChatService } from '../../service/ChatService';
import type { ChatMessage } from '../../types/ChatType';
import showErrorNotification from '../../Toast/NotificationError';

interface ChatRoomProps {
  startupId: number;
  startupName: string;
  members: string[];
}

export default function ChatRoom({ startupId, startupName, members }: ChatRoomProps) {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actualMembers, setActualMembers] = useState<string[]>(members || []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser?.id) return;

    let unsubscribe: (() => void) | undefined;

    const initChat = async () => {
      try {
        // Tạo hoặc lấy chat room (cho phép members rỗng nếu room đã tồn tại)
        await ChatService.getOrCreateChatRoom(startupId, startupName, members || []);

        // Lấy thông tin chat room để cập nhật số lượng members
        const roomInfo = await ChatService.getChatRoomInfo(`startup_${startupId}`);
        if (roomInfo?.members) {
          setActualMembers(roomInfo.members);
        }

        // Lắng nghe tin nhắn realtime
        unsubscribe = ChatService.subscribeToMessages(startupId, (msgs) => {
          setMessages(msgs);
          setIsLoading(false);
          scrollToBottom();
        });

        // Đánh dấu đã đọc
        if (currentUser?.id) {
          await ChatService.markMessagesAsRead(startupId, currentUser.id);
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
  }, [startupId, currentUser]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !file) return;
    if (!currentUser?.id) {
      showErrorNotification('Lỗi', 'Vui lòng đăng nhập');
      return;
    }

    setIsSending(true);
    try {
      if (file) {
        await ChatService.sendMessageWithFile(
          startupId,
          currentUser.id,
          currentUser.fullName,
          newMessage,
          file,
          currentUser.avatar
        );
      } else {
        await ChatService.sendMessage(
          startupId,
          currentUser.id,
          currentUser.fullName,
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
      <Center h="600px">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Paper shadow="sm" p="md" radius="md" h="600px" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Group mb="md" pb="md" style={{ borderBottom: '1px solid #e9ecef' }}>
        <Avatar size="md" radius="xl">
          {startupName[0]}
        </Avatar>
        <Box style={{ flex: 1 }}>
          <Text fw={600} size="lg">{startupName}</Text>
          <Text size="sm" c="dimmed">
            {actualMembers.length} thành viên
          </Text>
        </Box>
      </Group>

      {/* Messages */}
      <ScrollArea style={{ flex: 1 }} viewportRef={scrollRef} type="auto">
        <Stack gap="md" p="xs">
          {messages.length === 0 ? (
            <Center h="100%">
              <Text c="dimmed">Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!</Text>
            </Center>
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.userId === currentUser?.id;
              
              return (
                <Group
                  key={msg.id}
                  align="flex-start"
                  justify={isCurrentUser ? 'flex-end' : 'flex-start'}
                  wrap="nowrap"
                >
                  {!isCurrentUser && (
                    <Avatar src={msg.userAvatar} size="sm" radius="xl">
                      {msg.userName[0]}
                    </Avatar>
                  )}

                  <Stack gap={4} style={{ maxWidth: '70%' }}>
                    {!isCurrentUser && (
                      <Text size="xs" c="dimmed" pl="xs">{msg.userName}</Text>
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
                    <Avatar src={msg.userAvatar} size="sm" radius="xl">
                      {msg.userName[0]}
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
      <Box mt="md" pt="md" style={{ borderTop: '1px solid #e9ecef' }}>
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