import Layout from '../components/Layout';
import { TrendingUp, Users, Calendar, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StartUpCard from '../components/StartUpCard';

export default function Suggestion() {
  const navigate = useNavigate();

  const posts = [
    {
      id: 1,
      author: "Marcus Johnson",
      time: "2 hours ago",
      title: "AI-Powered Personal Finance Assistant",
      score: 92,
      likes: 127,
      comments: 23,
      category: "Công nghệ",
      evaluations: [
        { title: "Team", score: 18, maxScore: 20, description: "Đánh giá năng lực đội ngũ" },
        { title: "Ý tưởng", score: 5, maxScore: 20, description: "Tính độc đáo và khả thi của ý tưởng" },
        { title: "MVP/Prototype", score: 26, maxScore: 30, description: "Sản phẩm tối thiểu khả dụng" },
        { title: "Kế hoạch", score: 10, maxScore: 10, description: "Kế hoạch triển khai và phát triển" },
        { title: "Chiến lược", score: 16, maxScore: 20, description: "Chiến lược kinh doanh và marketing" }
      ]
    },
    {
      id: 2,
      author: "Sarah Chen",
      time: "4 hours ago",
      title: "Smart Urban Farming Solution",
      score: 60,
      likes: 89,
      comments: 15,
      category: "Nông nghiệp",
      evaluations: [
        { title: "Team", score: 16, maxScore: 20, description: "Đánh giá năng lực đội ngũ" },
        { title: "Ý tưởng", score: 16, maxScore: 20, description: "Tính độc đáo và khả thi của ý tưởng" },
        { title: "MVP/Prototype", score: 24, maxScore: 30, description: "Sản phẩm tối thiểu khả dụng" },
        { title: "Kế hoạch", score: 10, maxScore: 10, description: "Kế hoạch triển khai và phát triển" },
        { title: "Chiến lược", score: 18, maxScore: 20, description: "Chiến lược kinh doanh và marketing" }
      ]
    },
    {
      id: 3,
      author: "Alex Rivera",
      time: "6 hours ago",
      title: "Blockchain Healthcare Records",
      score: 78,
      likes: 156,
      comments: 32,
      category: "Y tế",
      evaluations: [
        { title: "Team", score: 15, maxScore: 20, description: "Đánh giá năng lực đội ngũ" },
        { title: "Ý tưởng", score: 15, maxScore: 20, description: "Tính độc đáo và khả thi của ý tưởng" },
        { title: "MVP/Prototype", score: 22, maxScore: 30, description: "Sản phẩm tối thiểu khả dụng" },
        { title: "Kế hoạch", score: 9, maxScore: 10, description: "Kế hoạch triển khai và phát triển" },
        { title: "Chiến lược", score: 17, maxScore: 20, description: "Chiến lược kinh doanh và marketing" }
      ]
    }
  ];

  const category = [
    { tag: "Công nghệ", posts: "2.3k bài viết" },
    { tag: "Nông nghiệp", posts: "1.8k bài viết" },
    { tag: "Fnb", posts: "1.2k bài viết" },
    { tag: "Kinh doanh", posts: "980 bài viết" },
    { tag: "Y tế", posts: "756 bài viết" }
  ];

  const trendingIdeas = [
    { title: "AI-Powered Code Review", category: "Công nghệ", likes: 234 },
    { title: "Smart Hydroponic System", category: "Nông nghiệp", likes: 189 },
    { title: "Blockchain Voting Platform", category: "Công nghệ phục vụ công đồng", likes: 156 }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3 ">
            <div className="bg-white rounded-lg shadow-sm p-4 fixed top-20 overflow-y-auto h-auto [&::-webkit-scrollbar]:hidden" style={{ width: 'inherit', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <nav className="space-y-2">
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg w-full text-left"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span >Trang chủ</span>
                </button>
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
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left bg-yellow-400 text-white"
                >
                  <Lightbulb className="w-5 h-5" />
                  <span className="font-medium">Đề xuất dự án phù hợp</span>
                </button>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-sm mb-3">Ý tưởng thịnh hành</h3>
                <div className="space-y-3">
                  {trendingIdeas.map((idea, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{idea.title}</div>
                        <div className="text-xs text-gray-500">{idea.category} • {idea.likes} likes</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-6 bg-gray-50">
            {/* Category Menu */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 sticky top-20 z-10">
              <div className="flex items-center space-x-4 overflow-x-auto py-2">
                <button className="px-4 py-2 bg-yellow-400 text-white rounded-full font-medium whitespace-nowrap">
                  Tất cả
                </button>
                {category.map((cat, idx) => (
                  <button key={idx} className="px-4 py-2 border border-gray-200 rounded-full font-medium whitespace-nowrap hover:bg-gray-50">
                    {cat.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <StartUpCard
                  key={post.id}
                  {...post}
                />
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3">
            <div className="sticky top-20 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-bold mb-4">Gợi ý dự án</h3>
                <p className="text-gray-600 text-sm">
                  Dựa trên sở thích và lịch sử của bạn
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}