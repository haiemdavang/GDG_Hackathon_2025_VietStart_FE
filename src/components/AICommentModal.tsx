import { X } from 'lucide-react';

export interface AICommentData {
  team: {
    score: number;
    comment: string;
  };
  idea: {
    score: number;
    comment: string;
  };
  prototype: {
    score: number;
    comment: string;
  };
  plan: {
    score: number;
    comment: string;
  };
  relationship: {
    score: number;
    comment: string;
  };
  overallScore: number;
  summary: string;
}

interface AICommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  commentData: AICommentData | null;
}

const evaluationTitles = {
  team: 'Team',
  idea: 'Ý tưởng',
  prototype: 'MVP/Prototype',
  plan: 'Kế hoạch',
  relationship: 'Chiến lược',
} as const;

const maxScores = {
  team: 20,
  idea: 20,
  prototype: 30,
  plan: 10,
  relationship: 20,
} as const;

export default function AICommentModal({ isOpen, onClose, commentData }: AICommentModalProps) {
  if (!isOpen || !commentData) return null;

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-purple-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getProgressColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return '#10B981';
    if (percentage >= 70) return '#8B5CF6';
    if (percentage >= 50) return '#F59E0B';
    return '#6B7280';
  };

  const getProgressPercentage = (score: number, maxScore: number) => {
    return (score / maxScore) * 100;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Đánh giá từ VietStart AI</h3>
            </div>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Overall Score */}
          <div className="text-center py-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl">
            <div className="text-5xl font-bold text-yellow-600 mb-2">{commentData.overallScore}/100</div>
            <div className="text-lg text-gray-700 font-medium">Tổng điểm</div>
            <div className="text-sm text-gray-500 mt-2">{commentData.summary}</div>
          </div>

          {/* Detailed Evaluations */}
          <div className="space-y-4">
            {Object.entries(commentData).map(([key, data]) => {
              if (key === 'overallScore' || key === 'summary') return null;
              
              const evaluationKey = key as keyof typeof evaluationTitles;
              const maxScore = maxScores[evaluationKey];
              const progressPercentage = getProgressPercentage(data.score, maxScore);
              const progressColor = getProgressColor(data.score, maxScore);
              const scoreColor = getScoreColor(data.score, maxScore);

              return (
                <div key={key} className="bg-gray-50 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#E5E7EB"
                            strokeWidth="4"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke={progressColor}
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${progressPercentage * 1.76} 176`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-lg font-bold ${scoreColor}`}>{data.score}</span>
                          <span className="text-xs text-gray-400">/{maxScore}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          {evaluationTitles[evaluationKey]}
                        </h4>
                        <div className={`text-sm font-medium ${scoreColor}`}>
                          {progressPercentage >= 80 ? 'Xuất sắc' : 
                           progressPercentage >= 70 ? 'Tốt' :
                           progressPercentage >= 50 ? 'Khá' : 'Cần cải thiện'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed">{data.comment}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="rounded-full px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
