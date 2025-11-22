import { Calendar, Lightbulb, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryService from '../../service/CategoryService';
import type { CategoryDto } from '../../types/CategoryType';
import Category from './Category';

interface TrendingIdea {
    title: string;
    category: string;
    likes: number;
}

interface SidebarProps {
    trendingIdeas: TrendingIdea[];
}

export default function Sidebar({ trendingIdeas }: SidebarProps) {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoadingCategories(true);
                const response = await CategoryService.getAllCategories();
                setCategories(response.data);
            } catch (error) {
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    const transformedCategories = categories.map(category => ({
        id: category.id,
        tag: category.name,
        posts: `${category.startupCount || 0} bài viết`
    }));

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 fixed top-20 overflow-y-auto h-[calc(100vh-5rem)] [&::-webkit-scrollbar]:hidden"
            style={{ width: 'inherit', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <nav className="space-y-2">
                <a href="#" className="flex items-center space-x-3 px-4 py-3 bg-yellow-400 text-white rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">Trang chủ</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5" />
                    <span>Cộng đồng</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5" />
                    <span>Ý tưởng của bạn</span>
                </a>
                <button
                    onClick={() => navigate('/suggestion')}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg w-full text-left"
                >
                    <Lightbulb className="w-5 h-5" />
                    <span>Đề xuất dự án phù hợp</span>
                </button>
            </nav>

            {isLoadingCategories ? (
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-bold text-sm mb-3">Danh mục</h3>
                    <p className="text-xs text-gray-500">Đang tải...</p>
                </div>
            ) : (
                <Category categories={transformedCategories} />
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-sm mb-3">Ý tưởng thịnh hành</h3>
                <div className="space-y-3">
                    {trendingIdeas.map((idea, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                            <div className={`w-2 h-2 rounded-full mt-2 ${idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-orange-500' : 'bg-green-500'
                                }`}></div>
                            <div className="flex-1">
                                <div className="text-sm font-medium">{idea.title}</div>
                                <div className="text-xs text-gray-500">{idea.category} • {idea.likes} likes</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
