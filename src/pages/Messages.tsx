import {
  Container,
  Title,
  Tabs,
  Stack,
  Group,
  Card,
  Avatar,
  Text,
  Badge,
  ActionIcon,
  Loader,
  Center,
  Box
} from '@mantine/core';
import { MessageCircle, Users, Mail, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import { ChatService } from '../service/ChatService';
import { PrivateChatService } from '../service/PrivateChatService';
import type { RootState } from '../store/store';
import type { ChatRoom } from '../types/ChatType';
import type { PrivateChatRoom } from '../types/PrivateChatType';
import { APP_ROUTES } from '../constant';

export default function Messages() {
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [groupChats, setGroupChats] = useState<ChatRoom[]>([]);
  const [privateChats, setPrivateChats] = useState<PrivateChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('group');

  useEffect(() => {
    loadChats();
  }, [currentUser]);

  const loadChats = async () => {
    if (!currentUser?.id) return;

    setIsLoading(true);
    try {
      // Load group chats
      const groupChatList = await ChatService.getUserChatRooms(currentUser.id);
      setGroupChats(groupChatList);

      // Load private chats
      const privateChatList = await PrivateChatService.getUserPrivateChatRooms(currentUser.id);
      setPrivateChats(privateChatList);
    } catch (error) {
      console.error('Error loading chats:', error);
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

  const getOtherUserName = (privateChat: PrivateChatRoom) => {
    if (!currentUser?.id) return 'Unknown';
    const otherUserId = privateChat.participants.find((id: string) => id !== currentUser.id);
    if (!otherUserId) return 'Unknown';
    return privateChat.participantNames[otherUserId] || 'User';
  };

  const getOtherUserAvatar = (privateChat: PrivateChatRoom) => {
    if (!currentUser?.id) return '';
    const otherUserId = privateChat.participants.find((id: string) => id !== currentUser.id);
    if (!otherUserId) return '';
    return privateChat.participantAvatars[otherUserId] || '';
  };

  const getUnreadCount = (chat: ChatRoom | PrivateChatRoom) => {
    if ('unreadCount' in chat && typeof chat.unreadCount === 'object') {
      return currentUser?.id ? chat.unreadCount[currentUser.id] || 0 : 0;
    }
    return 0;
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
          <Group justify="space-between">
            <Title order={2}>Tin nhắn</Title>
            <Group gap="xs">
              <ActionIcon
                size="lg"
                variant="light"
                color="blue"
                onClick={() => navigate(APP_ROUTES.INVITATIONS)}
                title="Lời mời nhận được"
              >
                <Mail size={20} />
              </ActionIcon>
              <ActionIcon
                size="lg"
                variant="light"
                color="green"
                onClick={() => navigate(APP_ROUTES.SENT_INVITATIONS)}
                title="Lời mời đã gửi"
              >
                <Send size={20} />
              </ActionIcon>
            </Group>
          </Group>

          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'group')}>
            <Tabs.List>
              <Tabs.Tab value="group" leftSection={<Users size={16} />}>
                Nhóm ({groupChats.length})
              </Tabs.Tab>
              <Tabs.Tab value="private" leftSection={<MessageCircle size={16} />}>
                Riêng tư ({privateChats.length})
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="group" pt="lg">
              <Stack gap="md">
                {groupChats.length === 0 ? (
                  <Card shadow="sm" padding="xl" radius="md" withBorder>
                    <Center>
                      <Stack align="center" gap="md">
                        <Users size={48} color="gray" />
                        <Text c="dimmed" ta="center">
                          Chưa có nhóm chat nào.
                          <br />
                          Tham gia một startup để bắt đầu trò chuyện!
                        </Text>
                      </Stack>
                    </Center>
                  </Card>
                ) : (
                  groupChats.map((chat) => (
                    <Card
                      key={chat.id}
                      shadow="sm"
                      padding="lg"
                      radius="md"
                      withBorder
                      style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                      onClick={() => navigate(APP_ROUTES.CHAT_ROOM(chat.startupId))}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Group wrap="nowrap">
                          <Avatar size="lg" radius="xl" color="blue">
                            <Users size={24} />
                          </Avatar>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text fw={600} size="lg" truncate>
                              {chat.startupName}
                            </Text>
                            <Text size="sm" c="dimmed" lineClamp={1}>
                              {chat.lastMessage || 'Chưa có tin nhắn'}
                            </Text>
                          </Box>
                        </Group>

                        <Stack align="flex-end" gap={4} style={{ minWidth: 'fit-content' }}>
                          <Text size="xs" c="dimmed">
                            {formatTime(chat.lastMessageTime)}
                          </Text>
                          {getUnreadCount(chat) > 0 && (
                            <Badge color="red" size="lg" circle>
                              {getUnreadCount(chat) > 99 ? '99+' : getUnreadCount(chat)}
                            </Badge>
                          )}
                        </Stack>
                      </Group>
                    </Card>
                  ))
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="private" pt="lg">
              <Stack gap="md">
                {privateChats.length === 0 ? (
                  <Card shadow="sm" padding="xl" radius="md" withBorder>
                    <Center>
                      <Stack align="center" gap="md">
                        <MessageCircle size={48} color="gray" />
                        <Text c="dimmed" ta="center">
                          Chưa có tin nhắn riêng tư nào.
                          <br />
                          Nhấp vào lời mời để bắt đầu trò chuyện!
                        </Text>
                      </Stack>
                    </Center>
                  </Card>
                ) : (
                  privateChats.map((chat) => (
                    <Card
                      key={chat.id}
                      shadow="sm"
                      padding="lg"
                      radius="md"
                      withBorder
                      style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                      onClick={() => navigate(APP_ROUTES.PRIVATE_CHAT(chat.id))}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Group wrap="nowrap">
                          <Avatar src={getOtherUserAvatar(chat)} size="lg" radius="xl">
                            {getOtherUserName(chat)[0]}
                          </Avatar>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text fw={600} size="lg" truncate>
                              {getOtherUserName(chat)}
                            </Text>
                            {chat.startupName && (
                              <Text size="xs" c="dimmed" truncate>
                                Về: {chat.startupName}
                              </Text>
                            )}
                            <Text size="sm" c="dimmed" lineClamp={1}>
                              {chat.lastMessage || 'Chưa có tin nhắn'}
                            </Text>
                          </Box>
                        </Group>

                        <Stack align="flex-end" gap={4} style={{ minWidth: 'fit-content' }}>
                          <Text size="xs" c="dimmed">
                            {formatTime(chat.lastMessageTime)}
                          </Text>
                          {getUnreadCount(chat) > 0 && (
                            <Badge color="red" size="lg" circle>
                              {getUnreadCount(chat) > 99 ? '99+' : getUnreadCount(chat)}
                            </Badge>
                          )}
                        </Stack>
                      </Group>
                    </Card>
                  ))
                )}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
    </Layout>
  );
}
