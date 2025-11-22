import {
  Card,
  Stack,
  Text,
  Group,
  Badge,
  Avatar,
  Container,
  Title,
  Loader,
  Center,
  Box
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessageCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { ChatService } from '../service/ChatService';
import type { ChatRoom } from '../types/ChatType';
import type { RootState } from '../store/store';

export default function ChatList() {
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChatRooms();
  }, [currentUser]);

  const loadChatRooms = async () => {
    if (!currentUser?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const rooms = await ChatService.getUserChatRooms(currentUser.id);
      // Sắp xếp theo thời gian tin nhắn cuối cùng
      rooms.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
      });
      setChatRooms(rooms);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Center h="calc(100vh - 200px)">
          <Loader size="lg" />
        </Center>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container size="lg" py="xl">
        <Stack gap="lg">
          <Group>
            <MessageCircle size={32} />
            <Title order={2}>Tin nhắn nhóm</Title>
          </Group>

          {chatRooms.length === 0 ? (
            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <Center>
                <Stack align="center" gap="md">
                  <MessageCircle size={48} color="gray" />
                  <Text c="dimmed" ta="center">
                    Chưa có nhóm chat nào.
                    <br />
                    Tham gia một startup để bắt đầu trò chuyện!
                  </Text>
                </Stack>
              </Center>
            </Card>
          ) : (
            <Stack gap="md">
              {chatRooms.map((room) => (
                <Card
                  key={room.id}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  onClick={() => navigate(`/chat/${room.startupId}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group wrap="nowrap">
                      <Avatar size="lg" radius="xl">
                        {room.startupName[0]}
                      </Avatar>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text fw={600} size="lg" truncate>
                          {room.startupName}
                        </Text>
                        <Text size="sm" c="dimmed" lineClamp={1}>
                          {room.lastMessage || 'Chưa có tin nhắn'}
                        </Text>
                      </Box>
                    </Group>

                    <Stack align="flex-end" gap={4} style={{ minWidth: 'fit-content' }}>
                      <Text size="xs" c="dimmed">
                        {formatTime(room.lastMessageTime)}
                      </Text>
                      {room.unreadCount > 0 && (
                        <Badge color="red" size="lg" circle>
                          {room.unreadCount > 99 ? '99+' : room.unreadCount}
                        </Badge>
                      )}
                    </Stack>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </Layout>
  );
}