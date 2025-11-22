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
import { Check, X, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import { TeamStartupService } from '../service/TeamStartupService';
import { PrivateChatService } from '../service/PrivateChatService';
import { StartupService } from '../service/StartupService';
import type { RootState } from '../store/store';
import type { InvitationDto } from '../types/PrivateChatType';
import showErrorNotification from '../Toast/NotificationError';
import showSuccessNotification from '../Toast/NotificationSuccess';

export default function Invitations() {
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [invitations, setInvitations] = useState<InvitationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadInvitations();
  }, [activeTab]);

  const loadInvitations = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const status = activeTab === 'pending' ? 'Pending' : 
                     activeTab === 'dealing' ? 'Dealing' : 
                     activeTab === 'success' ? 'Success' : 'Rejected';
      const response = await TeamStartupService.getMyInvitations(status);
      
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
        isOwner: false
      }));
      setInvitations(mappedInvitations);
    } catch (error) {
      showErrorNotification('Lỗi', 'Không thể tải danh sách lời mời');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPrivateChat = async (invitation: InvitationDto) => {
    if (!currentUser?.id) return;

    try {
      // Lấy thông tin startup để biết owner là ai
      const startupResponse = await StartupService.getStartupById(invitation.startUpId);
      const startupOwnerId = startupResponse.data.userId;
      
      // Tạo chat room giữa owner và receiver
      const chatRoomId = await PrivateChatService.getOrCreatePrivateChatRoom(
        startupOwnerId, // Owner ID từ startup
        currentUser.id, // Receiver ID (currentUser)
        '', // Owner name (will be updated in room)
        currentUser.fullName,
        '', // Owner avatar
        currentUser.avatar,
        invitation.id,
        invitation.startUpId,
        invitation.startUpIdea,
        startupOwnerId // Startup owner ID
      );

      navigate(`/private-chat/${chatRoomId}`);
    } catch (error) {
      showErrorNotification('Lỗi', 'Không thể mở chat');
    }
  };

  const handleAcceptInvitation = async (invitation: InvitationDto) => {
    if (!currentUser?.id) return;

    setProcessingId(invitation.id);
    try {
      // Lấy startup owner ID
      const startupResponse = await StartupService.getStartupById(invitation.startUpId);
      const startupOwnerId = startupResponse.data.userId;
      
      // Chuyển sang Dealing để trao đổi
      await TeamStartupService.moveToDealing(invitation.id);
      
      // Cập nhật status trong Firebase chat room
      const participants = [startupOwnerId, currentUser.id].sort();
      const chatRoomId = `private_invitation_${invitation.id}_${participants[0]}_${participants[1]}`;
      try {
        await PrivateChatService.updateChatRoomInvitationStatus(chatRoomId, 'Dealing');
      } catch (err) {
        console.log('Chat room chưa tồn tại, sẽ tạo khi mở chat');
      }
      
      showSuccessNotification('Thành công', 'Đã chấp nhận lời mời. Hãy trao đổi với chủ startup!');
      loadInvitations();
    } catch (error: any) {
      showErrorNotification('Lỗi', error.message || 'Không thể chấp nhận lời mời');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectInvitation = async (invitationId: number) => {
    setProcessingId(invitationId);
    try {
      await TeamStartupService.rejectInvitation(invitationId);
      showSuccessNotification('Thành công', 'Đã từ chối lời mời');
      loadInvitations();
    } catch (error: any) {
      showErrorNotification('Lỗi', error.message || 'Không thể từ chối lời mời');
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

  const renderInvitationCard = (invitation: InvitationDto) => (
    <Card key={invitation.id} shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <Avatar src={invitation.userAvatar} size="lg" radius="xl">
              {invitation.userFullName[0]}
            </Avatar>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text fw={600} size="md" lineClamp={2} style={{ wordBreak: 'break-word' }}>
                {invitation.startUpIdea}
              </Text>
              <Text size="sm" c="dimmed" mt={4}>
                Từ: {invitation.userFullName}
              </Text>
              <Badge color={getStatusColor(invitation.status)} size="sm" mt="xs">
                {invitation.status === 'Pending' ? 'Chờ xử lý' : 
                 invitation.status === 'Dealing' ? 'Đang trao đổi' :
                 invitation.status === 'Success' ? 'Thành công' : 'Đã từ chối'}
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

          {/* Actions dựa trên status */}
          {invitation.status === 'Pending' && (
            <>
              <Button
                leftSection={<Check size={18} />}
                color="green"
                onClick={() => handleAcceptInvitation(invitation)}
                loading={processingId === invitation.id}
                disabled={processingId !== null}
              >
                Chấp nhận
              </Button>
              <Button
                leftSection={<X size={18} />}
                color="red"
                variant="outline"
                onClick={() => handleRejectInvitation(invitation.id)}
                loading={processingId === invitation.id}
                disabled={processingId !== null}
              >
                Từ chối
              </Button>
            </>
          )}

          {invitation.status === 'Dealing' && (
            <Badge color="blue" size="lg">
              Đang chờ chủ startup hoàn tất
            </Badge>
          )}

          {invitation.status === 'Success' && (
            <Badge color="green" size="lg">
              Đã được thêm vào startup
            </Badge>
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
            <Title order={2}>Lời mời tham gia Startup</Title>
          </Group>

          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'pending')}>
            <Tabs.List>
              <Tabs.Tab value="pending">
                Chờ xử lý
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
                      <Text c="dimmed">Không có lời mời nào đang chờ xử lý</Text>
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
