import { Modal, ScrollArea, Stack } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { sections } from '../data/FivePartPostModalData';
import GeminiService from '../service/GeminiService';
import showErrorNotification from '../Toast/NotificationError';
import showSuccessNotification from '../Toast/NotificationSuccess';
import type { PointResponse, StartupInfo } from '../types/GeminiType';
import Footer from './PostStarup/Footer';
import Header from './PostStarup/Header';
import PostSectionItem from './PostStarup/PostSectionItem';
import ScoreSummaryAlert from './PostStarup/ScoreSummaryAlert';

export type FivePartPostPayload = {
  team: string;
  idea: string;
  prototype: string;
  plan: string;
  relationship: string;
};

interface FivePartPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: FivePartPostPayload, score?: PointResponse) => void;
  onAiEvaluate?: (payload: FivePartPostPayload) => void;
  initialData?: StartupInfo;
  initialScore?: PointResponse;
}

export default function FivePartPostModal({
  isOpen,
  onClose,
  onSubmit,
  onAiEvaluate,
  initialData,
  initialScore
}: FivePartPostModalProps) {
  const [formValues, setFormValues] = useState<FivePartPostPayload>({
    team: '',
    idea: '',
    prototype: '',
    plan: '',
    relationship: '',
  });
  const [showEvaluations, setShowEvaluations] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationScores, setEvaluationScores] = useState<PointResponse | null>(null);
  const [evaluationComments, setEvaluationComments] = useState<Record<string, string>>({});
  const [overallSummary, setOverallSummary] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Pre-fill form with formatted data from Gemini
        setFormValues({
          team: initialData.team || '',
          idea: initialData.idea || '',
          prototype: initialData.prototype || '',
          plan: initialData.plan || '',
          relationship: initialData.relationships || '',
        });
      } else {
        // Reset form if no initial data
        setFormValues({
          team: '',
          idea: '',
          prototype: '',
          plan: '',
          relationship: ''
        });
      }

      // Set initial score if provided
      if (initialScore) {
        setEvaluationScores(initialScore);
        setShowEvaluations(true);
      } else {
        setShowEvaluations(false);
        setEvaluationScores(null);
      }

      setEvaluationComments({});
      setOverallSummary('');
    }
  }, [isOpen, initialData, initialScore]);

  const disabled = useMemo(() =>
    !Object.values(formValues).some((value) => value.trim().length > 0),
    [formValues]);

  const canSubmit = useMemo(() => {
    if (disabled) return false;
    if (!evaluationScores) return false;
    return evaluationScores.TotalScore > 50;
  }, [disabled, evaluationScores]);

  const handleChange = (key: keyof FivePartPostPayload, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const trimmedValues = Object.fromEntries(
      Object.entries(formValues).map(([key, value]) => [key, value.trim()])
    ) as FivePartPostPayload;
    onSubmit(trimmedValues, evaluationScores || undefined);
  };

  const handleAiEvaluate = async () => {
    if (disabled) return;

    setIsEvaluating(true);
    setShowEvaluations(true);

    try {
      showSuccessNotification(
        'Đang chấm điểm',
        'AI đang đánh giá ý tưởng của bạn...'
      );

      // Convert form values to StartupInfo format
      const startupInfo: StartupInfo = {
        team: formValues.team,
        idea: formValues.idea,
        prototype: formValues.prototype,
        plan: formValues.plan,
        relationships: formValues.relationship,
      };

      // Call the score API
      const response = await GeminiService.calculatePoints(startupInfo);
      const score = response.data;

      // Store scores for display
      setEvaluationScores(score);

      // Set comments for each section
      const comments = {
        team: "Đánh giá năng lực đội ngũ dựa trên kinh nghiệm và kỹ năng chuyên môn.",
        idea: "Đánh giá tính độc đáo, khả thi và quy mô thị trường tiềm năng.",
        prototype: "Đánh giá sản phẩm mẫu, tính năng cốt lõi và khả năng demo.",
        plan: "Đánh giá kế hoạch triển khai, bán hàng và phát triển dài hạn.",
        relationship: "Đánh giá mối quan hệ chiến lược và vị thế trong ngành."
      };
      setEvaluationComments(comments);

      // Generate overall summary
      let summary = '';
      if (score.TotalScore >= 80) {
        summary = "🎉 Xuất sắc! Dự án có tiềm năng rất cao, nên tiếp tục phát triển và tìm kiếm nguồn vốn đầu tư.";
      } else if (score.TotalScore >= 70) {
        summary = "👍 Tốt! Dự án có tiềm năng, cần cải thiện một vài khía cạnh trước khi ra mắt thị trường.";
      } else if (score.TotalScore >= 50) {
        summary = "💡 Khá! Dự án có ý tưởng tốt nhưng cần nhiều cải thiện để cạnh tranh hiệu quả.";
      } else {
        summary = "⚠️ Cần cải thiện! Dự án cần đánh giá lại và cải thiện toàn diện các khía cạnh quan trọng.";
      }
      setOverallSummary(summary);

      setIsEvaluating(false);

      showSuccessNotification(
        'Chấm điểm hoàn tất',
        `Tổng điểm: ${score.TotalScore}/100`
      );

      if (onAiEvaluate) {
        onAiEvaluate(formValues);
      }
    } catch (error: any) {
      console.error('AI evaluation error:', error);
      setIsEvaluating(false);
      showErrorNotification(
        'Lỗi chấm điểm',
        error.message || 'Không thể chấm điểm. Vui lòng thử lại!'
      );
    }
  };

  const handleGetSuggestionForField = async (key: string): Promise<string> => {
    const startupInfo: StartupInfo = {
      team: formValues.team,
      idea: formValues.idea,
      prototype: formValues.prototype,
      plan: formValues.plan,
      relationships: formValues.relationship,
    };

    const response = await GeminiService.getSuggest(startupInfo);
    const suggestions = response.data.suggestions;

    const suggestionMap: Record<string, keyof StartupInfo> = {
      'team': 'team',
      'idea': 'idea',
      'prototype': 'prototype',
      'plan': 'plan',
      'relationship': 'relationships'
    };

    const suggestionKey = suggestionMap[key];
    return suggestionKey ? suggestions[suggestionKey] : '';
  };

  // Helper function to get score for each section
  const getScoreForSection = (key: string): number => {
    if (!evaluationScores) return 0;

    const scoreMap: Record<string, keyof PointResponse> = {
      'team': 'Team',
      'idea': 'Idea',
      'prototype': 'Prototype',
      'plan': 'Plan',
      'relationship': 'Relationships'
    };

    const scoreKey = scoreMap[key];
    return scoreKey ? evaluationScores[scoreKey] : 0;
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
      <Header onClose={onClose} />

      <ScrollArea style={{ flex: 1, minHeight: 0 }} p="lg" type="auto">
        <Stack gap="lg">
          {overallSummary && evaluationScores && (
            <ScoreSummaryAlert
              evaluationScores={evaluationScores}
              overallSummary={overallSummary}
            />
          )}

          <Stack gap="md">
            {sections.map((section) => {
              const scoreValue = getScoreForSection(section.key);
              const comment = evaluationComments[section.key];

              return (
                <PostSectionItem
                  key={section.key}
                  sectionKey={section.key}
                  title={section.title}
                  maxScore={section.maxScore}
                  placeholder={section.placeholder}
                  value={formValues[section.key]}
                  scoreValue={scoreValue}
                  comment={comment}
                  showEvaluations={showEvaluations}
                  isEvaluating={isEvaluating}
                  onChange={(value) => handleChange(section.key, value)}
                  onGetSuggestionForField={() => handleGetSuggestionForField(section.key)}
                />
              );
            })}
          </Stack>
        </Stack>
      </ScrollArea>

      <Footer
        evaluationScores={evaluationScores}
        canSubmit={canSubmit}
        disabled={disabled}
        isEvaluating={isEvaluating}
        onSubmit={handleSubmit}
        onAiEvaluate={handleAiEvaluate}
      />
    </Modal>
  );
}
