import { Alert, Text } from '@mantine/core';
import { Lightbulb } from 'lucide-react';
import type { PointResponse } from '../../types/GeminiType';

interface ScoreSummaryAlertProps {
    evaluationScores: PointResponse;
    overallSummary: string;
}

export default function ScoreSummaryAlert({ evaluationScores, overallSummary }: ScoreSummaryAlertProps) {
    const getColor = (score: number) => {
        if (score >= 70) return 'green';
        if (score >= 50) return 'yellow';
        return 'red';
    };

    return (
        <Alert
            icon={<Lightbulb size={20} />}
            title={<Text fw={600}>Tổng điểm: {evaluationScores.TotalScore}/100</Text>}
            color={getColor(evaluationScores.TotalScore)}
            radius="md"
        >
            {overallSummary}
        </Alert>
    );
}
