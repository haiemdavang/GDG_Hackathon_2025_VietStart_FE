import { Rocket, Star } from 'lucide-react';

interface Suggestion {
    name: string;
    followers: string;
    verified: boolean;
}

interface SuggestFollowProps {
    suggestions: Suggestion[];
}

export default function SuggestFollow({ suggestions }: SuggestFollowProps) {
    return (
        <div className="sticky top-20 space-y-6">
            {/* CTA Card */}
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-6 text-white relative overflow-hidden">
                <Rocket className="absolute top-4 right-4 w-16 h-16 opacity-20" />
                <h3 className="text-xl font-bold mb-2">Bắt đầu startup của bạn!</h3>
                <p className="text-sm mb-4 text-yellow-50">Chia sẻ ý tưởng và tìm kiếm đồng đội</p>
                <button className="w-full bg-white text-yellow-600 py-2 rounded-lg font-medium hover:bg-yellow-50">
                    Tạo dự án mới
                </button>
            </div>

            {/* Suggestions */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">Gợi ý theo dõi</h3>
                    <a href="#" className="text-yellow-600 text-sm hover:underline">Xem tất cả</a>
                </div>
                <div className="space-y-3">
                    {suggestions.map((user, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                                <div>
                                    <div className="flex items-center space-x-1">
                                        <span className="font-medium text-sm">{user.name}</span>
                                        {user.verified && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
                                    </div>
                                    <p className="text-xs text-gray-500">{user.followers}</p>
                                </div>
                            </div>
                            <Star className="w-5 h-5 text-yellow-400 cursor-pointer hover:fill-current" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-bold mb-4">Thống kê của bạn</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Ý tưởng</span>
                        <span className="font-bold">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Trung bình đánh giá</span>
                        <span className="font-bold text-green-600">7.8</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Đóng góp</span>
                        <span className="font-bold">45</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Người theo dõi</span>
                        <span className="font-bold">128</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
