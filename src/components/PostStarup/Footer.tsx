import { Button, Group, Image, Loader, Text } from '@mantine/core';
import type { PointResponse } from '../../types/GeminiType';

interface FooterProps {
    evaluationScores: PointResponse | null;
    canSubmit: boolean;
    disabled: boolean;
    isEvaluating: boolean;
    
    onSubmit: () => void;
    onAiEvaluate: () => void;
}

export default function Footer({
    evaluationScores,
    canSubmit,
    disabled,
    isEvaluating,
    onSubmit,
    onAiEvaluate
}: FooterProps) {
    const getSubmitButtonText = () => {
        if (!evaluationScores) return 'Chấm điểm trước để đăng bài';
        if (evaluationScores.TotalScore <= 50) {
            return `Cần tối thiểu 61 điểm (${evaluationScores.TotalScore}/100)`;
        }
        return 'Đăng bài';
    };

    return (
        <Group justify="space-between" p="lg" gap="sm" style={{ borderTop: '1px solid #e9ecef', flexShrink: 0 }}>
            {evaluationScores && (
                <Group gap="xs">
                    <Text size="sm" fw={600}>Tổng điểm:</Text>
                    <Text
                        size="lg"
                        fw={700}
                        c={evaluationScores.TotalScore >= 70 ? 'green' : evaluationScores.TotalScore >= 50 ? 'yellow' : 'red'}
                    >
                        {evaluationScores.TotalScore}/100
                    </Text>
                </Group>
            )}
            <Group gap="sm" style={{ marginLeft: 'auto' }}>
                <Button
                    onClick={onSubmit}
                    disabled={!canSubmit}
                    radius="xl"
                    size="md"
                    color="goldenDream"
                >
                    {getSubmitButtonText()}
                </Button>
                <Button
                    onClick={onAiEvaluate}
                    variant="outline"
                    color="goldenDream"
                    radius="xl"
                    size="md"
                    leftSection={isEvaluating ? <Loader size="xs" /> : <Image src="/gemini-color.png" h={16} />}
                    disabled={isEvaluating || disabled}
                >
                    {isEvaluating ? 'Đang chấm điểm...' : 'Chấm điểm'}
                </Button>
            </Group>
        </Group>
    );
}
