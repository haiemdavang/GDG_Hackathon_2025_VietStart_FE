import { Globe, Lock, Rocket, Share2 } from 'lucide-react';

interface StartUpCardContentShareProps {
    sharedBy: string;
    sharedByAvatar?: string;
    sharedTime: string;
    shareComment?: string;
    originalAuthor: string;
    originalAvatar?: string;
    originalTime: string;
    title: string;
    score: number;
    category: string;
    visibility: boolean;
    scoreColors: {
        bg: string;
        text: string;
        light: string;
    };
}

export default function StartUpCardContentShare({
    sharedBy,
    sharedByAvatar,
    sharedTime,
    shareComment,
    originalAuthor,
    originalAvatar,
    originalTime,
    title,
    score,
    category,
    visibility,
    scoreColors
}: StartUpCardContentShareProps) {
    return (
        <>
            {/* Shared By Header */}
            <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full overflow-hidden">
                    {sharedByAvatar && <img src={sharedByAvatar} alt={sharedBy} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{sharedBy}</h3>
                        <Share2 size={14} className="text-gray-500" />
                        <span className="text-sm text-gray-500">đã chia sẻ</span>
                    </div>
                    <p className="text-sm text-gray-500">{sharedTime}</p>
                </div>
            </div>

            {/* Share Comment */}
            {shareComment && (
                <p className="text-sm text-gray-700 mb-3">{shareComment}</p>
            )}

            {/* Original Post Card */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-800 rounded-full overflow-hidden">
                            {originalAvatar && <img src={originalAvatar} alt={originalAuthor} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">{originalAuthor}</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-500">{originalTime}</p>
                                {visibility ? (
                                    <Globe size={12} className="text-green-600" />
                                ) : (
                                    <Lock size={12} className="text-gray-600" />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={`flex items-center space-x-2 rounded-[50px] px-2 py-1 ${scoreColors.bg}`}>
                        <Rocket className={`w-3 h-3 ${scoreColors.text}`} />
                        <span className={`text-lg font-bold ${scoreColors.text}`}>{score}</span>
                        <span className={`text-xs ${scoreColors.light}`}>/100</span>
                    </div>
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">{category}</span>
            </div>
        </>
    );
}
