import { useNavigate, useSearchParams } from 'react-router-dom';

interface CategoryProps {
    categories: Array<{
        id?: number;
        tag: string;
        posts: string;
    }>;
}

export default function Category({ categories }: CategoryProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const selectedCategoryId = searchParams.get('categoryId');

    const handleCategoryClick = (categoryId?: number) => {
        if (categoryId) {
            navigate(`/?categoryId=${categoryId}`);
        } else {
            navigate('/');
        }
    };

    const isAllSelected = !selectedCategoryId;

    return (
        <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-bold text-sm mb-3">Danh mục</h3>
            <div className="space-y-3">
                {/* All Categories Item */}
                <button
                    onClick={() => handleCategoryClick()}
                    className={`block w-full text-left p-2 rounded transition-colors ${isAllSelected
                            ? 'bg-yellow-100 border border-yellow-400'
                            : 'hover:bg-gray-50'
                        }`}
                >
                    <div className={`font-medium text-sm ${isAllSelected ? 'text-yellow-700' : ''}`}>
                        Tất cả
                    </div>
                    <div className="text-xs text-gray-500">Tất cả danh mục</div>
                </button>

                {/* Category Items */}
                {categories.map((trend, idx) => {
                    const isSelected = trend.id?.toString() === selectedCategoryId;
                    return (
                        <button
                            key={idx}
                            onClick={() => handleCategoryClick(trend.id)}
                            className={`block w-full text-left p-2 rounded transition-colors ${isSelected
                                    ? 'bg-yellow-100 border border-yellow-400'
                                    : 'hover:bg-gray-50'
                                }`}
                        >
                            <div className={`font-medium text-sm ${isSelected ? 'text-yellow-700' : ''}`}>
                                {trend.tag}
                            </div>
                            <div className="text-xs text-gray-500">{trend.posts}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
