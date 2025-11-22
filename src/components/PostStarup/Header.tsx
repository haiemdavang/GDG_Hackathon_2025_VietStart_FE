import { Button, Group, Stack, Text, Title } from '@mantine/core';

interface HeaderProps {
    onClose: () => void;
}

export default function Header({ onClose }: HeaderProps) {
    return (
        <Stack gap={4} p="lg" style={{ borderBottom: '1px solid #e9ecef', flexShrink: 0 }}>
            <Group justify="space-between">
                <div>
                    <Title order={3}>Xác nhận ý tưởng</Title>
                    <Text size="xs" c="dimmed">
                        Hoàn thiện thông tin để VietStart AI chấm điểm
                    </Text>
                </div>
                <Button variant="subtle" color="gray" onClick={onClose} size="sm">
                    ✕
                </Button>
            </Group>
        </Stack>
    );
}
