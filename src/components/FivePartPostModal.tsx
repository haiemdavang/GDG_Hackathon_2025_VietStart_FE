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

 
 

  // Helper function to get score for each section
 

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
