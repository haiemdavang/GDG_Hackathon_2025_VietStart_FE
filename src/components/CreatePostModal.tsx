import {
  Avatar,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  Textarea
} from '@mantine/core';
import { Bot, Globe, Lock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import unknownAvatar from '../assets/unknown_avatar.jpg';

export type CreatePostPayload = {
  content: string;
  visibility: 'public' | 'private';
  hashtags: string[];
  category: string;
  categoryId: number;
  aiAssist: boolean;
  formattedData?: StartupInfo;
  score?: PointResponse;
};

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreatePostPayload) => void;
}

export default function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [hashtags, setHashtags] = useState('');
  const [category, setCategory] = useState('Công nghệ');
  const [aiAssist, setAiAssist] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch categories on mount
  

  const disabled = useMemo(() => !content.trim(), [content]);

  const handleSubmit = async () => {
    if (disabled || isSubmitting) return;

    setIsSubmitting(true);

  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      size="xl"
      radius="lg"
      centered
      withCloseButton={false}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        body: { padding: 0, height: '85vh', display: 'flex', flexDirection: 'column' },
        content: { maxHeight: '90vh' }
      }}
    >
      {/* Fixed Header */}
      <Stack gap={4} p="lg" style={{ borderBottom: '1px solid #e9ecef', flexShrink: 0 }}>
        <Group justify="space-between">
          <div>
            <Text size="xl" fw={700}>Tạo bài viết</Text>
            <Text size="xs" c="dimmed">
              Chia sẻ ý tưởng khởi nghiệp với cộng đồng
            </Text>
          </div>
          <Button variant="subtle" color="gray" onClick={onClose} size="sm" disabled={isSubmitting}>
            ✕
          </Button>
        </Group>
      </Stack>

      {/* Scrollable Content */}
      <ScrollArea style={{ flex: 1, minHeight: 0 }} p="lg" type="auto">
        <Stack gap="lg">
          {/* User Info Section */}
          <Group gap="md" align="flex-start">
            <Avatar
              src={user?.avatar || unknownAvatar}
              size={48}
              radius="xl"
            />
            <Stack gap={4}>
              <Text fw={600}>{user?.fullName || 'Bạn'}</Text>
              <SegmentedControl
                value={visibility}
                onChange={(value) => setVisibility(value as 'public' | 'private')}
                size="xs"
                style={{ width: 'fit-content' }}
                disabled={isSubmitting}
                data={[
                  {
                    value: 'public',
                    label: (
                      <Group gap={6} className='!flex-nowrap'>
                        <Globe size={14} />
                        <span>Công khai</span>
                      </Group>
                    ),
                  },
                  {
                    value: 'private',
                    label: (
                      <Group gap={6} className='!flex-nowrap'>
                        <Lock size={14} />
                        <span>Riêng tư</span>
                      </Group>
                    ),
                  },
                ]}
              />
            </Stack>
            <Select
              value={category}
              onChange={(value) => setCategory(value || category)}
              data={categories.map(cat => ({ value: cat.name, label: cat.name }))}
              size="sm"
              radius="md"
              style={{ minWidth: 150, marginLeft: 'auto' }}
              comboboxProps={{ withinPortal: true }}
              disabled={isSubmitting || isLoadingCategories}
              placeholder={isLoadingCategories ? 'Đang tải...' : 'Chọn danh mục'}
            />
          </Group>

          {/* Content Textarea */}
          <Textarea
            placeholder="Mô tả ý tưởng khởi nghiệp của bạn
• Team: gồm bao nhiêu người, công việc của từng người
• Idea: mục đích của ý tưởng, cách hoạt động của sản phẩm,...
• Prototype: link MVP, demo, hình ảnh sản phẩm,...
• Plan: kế hoạch triển khai và phát triển
• Relationship: mối quan hệ với cộng đồng"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            minRows={6}
            autosize
            maxRows={10}
            size="md"
            radius="md"
            disabled={isSubmitting}
          />

          {/* Hashtags Section */}
          <Paper p="md" radius="md" withBorder bg="gray.0">
            <Stack gap="xs">
              <div>
                <Text size="sm" fw={600}>Hashtag</Text>
                <Text size="xs" c="dimmed">
                  Phân tách bằng dấu phẩy, ví dụ: Công nghệ, Nông nghiệp,...
                </Text>
              </div>
              <Textarea
                placeholder="#Công nghệ, #Nông nghiệp, #Y tế, ..."
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                radius="md"
                disabled={isSubmitting}
                minRows={2}
                autosize
              />
            </Stack>
          </Paper>

          {/* AI Assist Section */}
          <Paper p="md" radius="md" withBorder bg="gray.0">
            <Group justify="space-between">
              <div style={{ flex: 1 }}>
                <Group gap="xs">
                  <Bot size={16} />
                  <Text size="sm" fw={600}>Trợ lý AI</Text>
                </Group>
                <Text size="xs" c="dimmed">
                  Sử dụng AI để phân tích và chấm điểm ý tưởng
                </Text>
              </div>
              <Switch
                checked={aiAssist}
                onChange={(e) => setAiAssist(e.currentTarget.checked)}
                size="md"
                disabled={isSubmitting}
              />
            </Group>
          </Paper>
        </Stack>
      </ScrollArea>

      {/* Fixed Footer */}
      <Group justify="space-between" p="lg" style={{ borderTop: '1px solid #e9ecef', flexShrink: 0 }}>
        <Text size="xs" c="dimmed" style={{ flex: 1 }}>
          {aiAssist
            ? 'AI sẽ phân tích và đánh giá ý tưởng của bạn'
            : 'Bài viết của bạn sẽ tuân theo quy tắc cộng đồng VietStart'
          }
        </Text>
        <Button
          onClick={handleSubmit}
          disabled={disabled || isSubmitting}
          radius="xl"
          size="md"
          color="goldenDream"
          leftSection={isSubmitting ? <Loader size="xs" color="white" /> : null}
        >
          {isSubmitting ? 'Đang xử lý...' : 'Bước tiếp theo'}
        </Button>
      </Group>
    </Modal>
  );
}
