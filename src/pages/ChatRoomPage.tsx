import { Container, Button, Group } from '@mantine/core';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ChatRoom from '../components/ChatGroup/ChatRoom';
import { StartupService } from '../service/StartupService';
import showErrorNotification from '../Toast/NotificationError';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

export default function ChatRoomPage() {
  const navigate = useNavigate();
  const { startupId } = useParams<{ startupId: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [startupName, setStartupName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStartupInfo();
  }, [startupId]);

  const loadStartupInfo = async () => {
    if (!startupId || !currentUser) return;

    try {
      // Lấy thông tin startup
      const response = await StartupService.getStartupById(parseInt(startupId));
      const startup = response.data;
      setStartupName(startup.idea || startup.team || 'Startup Chat');

      // Members sẽ được lấy từ Firebase trong ChatRoom component
      // Không cần gọi API backend vì Firebase đã có danh sách members chính xác
      setMembers([]);
    } catch (error) {
      showErrorNotification('Lỗi', 'Không thể tải thông tin startup');
      navigate('/chat');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Container size="lg" py="xl">
          Đang tải...
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container size="lg" py="xl">
        <Group mb="lg">
          <Button
            variant="subtle"
            leftSection={<ArrowLeft size={18} />}
            onClick={() => navigate('/chat')}
          >
            Quay lại
          </Button>
        </Group>

        <ChatRoom
          startupId={parseInt(startupId!)}
          startupName={startupName}
          members={members}
        />
      </Container>
    </Layout>
  );
}