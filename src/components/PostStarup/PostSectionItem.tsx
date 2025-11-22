import { Button, Group, Image, Paper, RingProgress, Stack, Text, Textarea } from '@mantine/core';
import { Bot, Check, X } from 'lucide-react';
import { useState } from 'react';

interface PostSectionItemProps {
    sectionKey: string;
    title: string;
    maxScore: number;
    placeholder: string;
    value: string;
    scoreValue: number;
    comment?: string;
    showEvaluations: boolean;
    isEvaluating: boolean;
    onChange: (value: string) => void;
    onGetSuggestionForField: () => Promise<string>; // Changed from Promise<void> to Promise<string>
}

export default function PostSectionItem({
    title,
    maxScore,
    placeholder,
    value,
    scoreValue,
    comment,
    showEvaluations,
    isEvaluating,
    onChange,
    onGetSuggestionForField
}: PostSectionItemProps) {
    const percentage = (scoreValue / maxScore) * 100;
    const [suggestion, setSuggestion] = useState<string>('');
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

    const handleGetSuggestion = async () => {
        setIsLoadingSuggestion(true);
        try {
            const result = await onGetSuggestionForField();
            setSuggestion(result as any);
        } catch (error) {
            console.error('Error getting suggestion:', error);
        } finally {
            setIsLoadingSuggestion(false);
        }
    };

    const handleAcceptSuggestion = () => {
        if (suggestion) {
            onChange(suggestion);
            setSuggestion('');
        }
    };

    const handleRejectSuggestion = () => {
        setSuggestion('');
    };

    return (
        <Paper p="md" radius="md" withBorder bg="gray.0">
            <Stack gap="xs">
                <Group justify="space-between" align="center">
                    <div>
                        <Text size="sm" fw={600}>{title}</Text>
                        <Text size="sm" c="dimmed">Tối đa {maxScore} điểm</Text>
                    </div>
                    <Group gap="xs">
                        {showEvaluations && percentage < 70 && (
                            <Button
                                size="xs"
                                variant="light"
                                color="violet"
                                onClick={handleGetSuggestion}
                                loading={isLoadingSuggestion}
                            >
                                <Image src="/Google_Gemini_logo.svg.png" h={14} />
                            </Button>
                        )}
                        {showEvaluations && (
                            <RingProgress
                                size={60}
                                thickness={4}
                                sections={[{
                                    value: percentage,
                                    color: percentage >= 70 ? 'green' : percentage >= 50 ? 'yellow' : 'red'
                                }]}
                                label={
                                    <Text size="xs" fw={700} ta="center">
                                        {isEvaluating ? '...' : `${scoreValue}/${maxScore}`}
                                    </Text>
                                }
                            />
                        )}
                    </Group>
                </Group>

                {/* Show suggestion if available */}
                {suggestion && (
                    <Paper p="sm" radius="sm" withBorder bg="violet.0">
                        <Stack gap="sm">
                            <Group gap="xs">
                                <Image src="/gemini-color.png" h={14} />
                                <Text size="xs" fw={600} c="blue.7">
                                    Gợi ý từ AI:
                                </Text>
                            </Group>
                            <Text size="sm" c="blue.9" style={{ whiteSpace: 'pre-wrap' }}>
                                {suggestion}
                            </Text>
                            <Group gap="xs" justify="flex-end">
                                <Button
                                    size="xs"
                                    variant="filled"
                                    color="green"
                                    leftSection={<Check size={14} />}
                                    onClick={handleAcceptSuggestion}
                                >
                                    Chấp nhận
                                </Button>
                                <Button
                                    size="xs"
                                    variant="subtle"
                                    color="gray"
                                    leftSection={<X size={14} />}
                                    onClick={handleRejectSuggestion}
                                >
                                    Bỏ qua
                                </Button>
                            </Group>
                        </Stack>
                    </Paper>
                )}

                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    minRows={3}
                    autosize
                    maxRows={6}
                    radius="md"
                />

                {comment && (
                    <Paper p="sm" radius="sm" withBorder bg="blue.0">
                        <Group gap="xs">
                            <Bot size={14} />
                            <Text size="xs" c="blue.7" style={{ flex: 1 }}>
                                {comment}
                            </Text>
                        </Group>
                    </Paper>
                )}
            </Stack>
        </Paper>
    );
}
