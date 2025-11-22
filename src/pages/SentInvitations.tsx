import {
  Container,
  Title,
  Card,
  Stack,
  Group,
  Avatar,
  Text,
  Badge,
  Button,
  Tabs,
  Loader,
  Center,
  ActionIcon,
  Box
} from '@mantine/core';
import { MessageCircle, CheckCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import { TeamStartupService } from '../service/TeamStartupService';
import { PrivateChatService } from '../service/PrivateChatService';
import { ChatService } from '../service/ChatService';
import type { RootState } from '../store/store';
import type { InvitationDto } from '../types/PrivateChatType';
import showErrorNotification from '../Toast/NotificationError';
import showSuccessNotification from '../Toast/NotificationSuccess';
import { APP_ROUTES } from '../constant';

export default function SentInvitations() {
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [invitations, setInvitations] = useState<InvitationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadSentInvitations();
  }, [activeTab]);

  const loadSentInvitations = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const status = activeTab === 'pending' ? 'Pending' : 
                     activeTab === 'dealing' ? 'Dealing' : 
                     activeTab === 'success' ? 'Success' : 'Rejected';
      const response = await TeamStartupService.getMySentInvitations(status);
      
      // Convert status number to string
      const statusMap: { [key: number]: 'Pending' | 'Dealing' | 'Success' | 'Rejected' } = {
        0: 'Pending',
        1: 'Dealing',
        2: 'Success',
        3: 'Rejected'
      };
      
      const mappedInvitations: InvitationDto[] = response.data.data.map(item => ({
        id: item.id,
        startUpId: item.startUpId,
        startUpIdea: item.startUpIdea,
        startUpName: item.startUpIdea,
        userId: item.userId,
        userFullName: item.userFullName,
        userAvatar: item.userAvatar,
        status: typeof item.status === 'number' ? statusMap[item.status] : item.status as 'Pending' | 'Dealing' | 'Success' | 'Rejected',
        isOwner: true
      }));
      setInvitations(mappedInvitations);
    } catch (error) {
      showErrorNotification('Lỗi', 'Không thể tải danh sách lời mời đã gửi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPrivateChat = async (invitation: InvitationDto) => {
    if (!currentUser?.id) return;

    try {
      // Owner (currentUser) mở chat với receiver (invitation.userId)
      const chatRoomId = await PrivateChatService.getOrCreatePrivateChatRoom(
        currentUser.id, // Owner ID
        invitation.userId, // Receiver ID
        currentUser.fullName, // Owner name
        invitation.userFullName, // Receiver name
        currentUser.avatar, // Owner avatar
        invitation.userAvatar, // Receiver avatar
        invitation.id,
        invitation.startUpId,
        invitation.startUpIdea,
        currentUser.id // Startup owner ID (chính là currentUser)
      );

      navigate(`/private-chat/${chatRoomId}`);
    } catch (error: any) {
      showErrorNotification('Lỗi', error.message || 'Không thể mở chat');
    }
  };

  const handleMarkAsSuccess = async (invitation: InvitationDto) => {
    if (!currentUser?.id) return;

    setProcessingId(invitation.id);
    try {
      // 1. Gọi API để cập nhật status = Success
      await TeamStartupService.markAsSuccess(invitation.id);
      
      // 2. Thêm member vào group chat (tự động tạo nếu chưa có)
      await ChatService.addMemberToRoom(
        invitation.startUpId,
        invitation.userId,
        invitation.startUpIdea,
        currentUser.id
      );

      // 4. Cập nhật status trong Firebase private chat room
      const participants = [currentUser.id, invitation.userId].sort();
      const chatRoomId = `private_invitation_${invitation.id}_${participants[0]}_${participants[1]}`;
      try {
        await PrivateChatService.updateChatRoomInvitationStatus(chatRoomId, 'Success');
      } catch (err) {
        console.log('Không cập nhật được Firebase chat room status');
      }

      showSuccessNotification('Thành công', 'Đã hoàn tất chiêu mộ và tạo nhóm chat');
      loadSentInvitations();
    } catch (error: any) {
      showErrorNotification('Lỗi', error.message || 'Không thể hoàn tất chiêu mộ');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelInvitation = async (invitationId: number) => {
    setProcessingId(invitationId);
    try {
      await TeamStartupService.rejectInvitation(invitationId);
      showSuccessNotification('Thành công', 'Đã hủy lời mời');
      loadSentInvitations();
    } catch (error: any) {
      showErrorNotification('Lỗi', error.message || 'Không thể hủy lời mời');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'yellow';
      case 'Dealing':
        return 'blue';
      case 'Success':
        return 'green';
      case 'Rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Chờ phản hồi';
      case 'Dealing':
        return 'Đang trao đổi';
      case 'Success':
        return 'Thành công';
      case 'Rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const renderInvitationCard = (invitation: InvitationDto) => (
    <Card key={invitation.id} shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <Avatar src={invitation.userAvatar} size="lg" radius="xl">
              {invitation.userFullName[0]}
            </Avatar>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text fw={600} size="md">
                {invitation.userFullName}
              </Text>
              <Text size="sm" c="dimmed" lineClamp={2} style={{ wordBreak: 'break-word' }} mt={4}>
                Startup: {invitation.startUpIdea}
              </Text>
              <Badge color={getStatusColor(invitation.status)} size="sm" mt="xs">
                {getStatusText(invitation.status)}
              </Badge>
            </Box>
          </Group>
        </Group>

        <Group gap="xs" justify="flex-end">
          {/* Icon nhắn tin riêng */}
          <ActionIcon
            size="lg"
            variant="light"
            color="blue"
            onClick={() => handleOpenPrivateChat(invitation)}
            title="Nhắn tin riêng"
          >
            <MessageCircle size={20} />
          </ActionIcon>

          {/* Actions based on status */}
          {invitation.status === 'Pending' && (
            <Button
              leftSection={<X size={18} />}
              color="red"
              variant="outline"
              onClick={() => handleCancelInvitation(invitation.id)}
              loading={processingId === invitation.id}
              disabled={processingId !== null}
            >
              Hủy lời mời
            </Button>
          )}

          {invitation.status === 'Dealing' && (
            <Button
              leftSection={<CheckCircle size={18} />}
              color="green"
              onClick={() => handleMarkAsSuccess(invitation)}
              loading={processingId === invitation.id}
              disabled={processingId !== null}
            >
              Hoàn tất chiêu mộ
            </Button>
          )}

          {invitation.status === 'Success' && (
            <Button
              variant="light"
              color="blue"
              onClick={() => navigate(APP_ROUTES.CHAT_ROOM(invitation.startUpId))}
            >
              Vào nhóm chat
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );

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
            <Title order={2}>Lời mời đã gửi</Title>
          </Group>

          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'pending')}>
            <Tabs.List>
              <Tabs.Tab value="pending">
                Chờ phản hồi
              </Tabs.Tab>
              <Tabs.Tab value="dealing">
                Đang trao đổi
              </Tabs.Tab>
              <Tabs.Tab value="success">
                Thành công
              </Tabs.Tab>
              <Tabs.Tab value="rejected">
                Đã từ chối
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="pending" pt="lg">
              <Stack gap="md">
                {invitations.length === 0 ? (
                  <Card shadow="sm" padding="xl" radius="md" withBorder>
                    <Center>
                      <Text c="dimmed">Không có lời mời nào đang chờ phản hồi</Text>
                    </Center>
                  </Card>
                ) : (
                  invitations.map(renderInvitationCard)
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="dealing" pt="lg">
              <Stack gap="md">
                {invitations.length === 0 ? (
                  <Card shadow="sm" padding="xl" radius="md" withBorder>
                    <Center>
                      <Text c="dimmed">Không có lời mời nào đang trao đổi</Text>
                    </Center>
                  </Card>
                ) : (
                  invitations.map(renderInvitationCard)
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="success" pt="lg">
              <Stack gap="md">
                {invitations.length === 0 ? (
                  <Card shadow="sm" padding="xl" radius="md" withBorder>
                    <Center>
                      <Text c="dimmed">Chưa có lời mời nào thành công</Text>
                    </Center>
                  </Card>
                ) : (
                  invitations.map(renderInvitationCard)
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="rejected" pt="lg">
              <Stack gap="md">
                {invitations.length === 0 ? (
                  <Card shadow="sm" padding="xl" radius="md" withBorder>
                    <Center>
                      <Text c="dimmed">Chưa có lời mời nào bị từ chối</Text>
                    </Center>
                  </Card>
                ) : (
                  invitations.map(renderInvitationCard)
                )}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
    </Layout>
  );
}
