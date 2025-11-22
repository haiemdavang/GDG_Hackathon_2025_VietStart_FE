import { Share2, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import unknownAvatar from "../assets/unknown_avatar.jpg";
import CreatePostModal, { type CreatePostPayload } from '../components/CreatePostModal';
import FivePartPostModal, { type FivePartPostPayload } from '../components/FivePartPostModal';
import Sidebar from '../components/Home/Sidebar';
import SuggestFollow from '../components/Home/SuggestFollow';
import Layout from '../components/Layout';
import StartUpCard from '../components/StartUpCard';
import { sharedPosts } from '../data/SharedPostsData';
import { suggestions } from '../data/SuggestionsData';
import { trendingIdeas } from '../data/TrendingIdeasData';
import StartupService from '../service/StartupService';
import { useAppSelector } from '../store/hooks';
import showErrorNotification from '../Toast/NotificationError';
import showSuccessNotification from '../Toast/NotificationSuccess';
import type { PointResponse } from '../types/GeminiType';
import type { CreateStartUpDto, StartUpDto } from '../types/StartupType';

export default function VietStartLayout() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId');

  const [startups, setStartups] = useState<StartUpDto[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFivePartModal, setShowFivePartModal] = useState(false);
  const [initialPostData, setInitialPostData] = useState<CreatePostPayload | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);
  const pageSize = 10;

  const fetchStartups = async (pageNumber: number, isInitial: boolean = false) => {
    if (isLoading || (!hasMore && !isInitial)) return;
    
  };

  useEffect(() => {
    fetchStartups(1, true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (page > 1) {
      fetchStartups(page);
    }
  }, [page]);

  const handleCreatePost = (payload: CreatePostPayload) => {
    setInitialPostData(payload);
    setShowCreateModal(false);
    setShowFivePartModal(true);
  };

  const handleFivePartSubmit = async (payload: FivePartPostPayload, score?: PointResponse) => {
    if (!initialPostData) return;

    
  };

  const handleAiEvaluate = (payload: FivePartPostPayload) => {
    console.log('AI Evaluate payload:', payload);
  };

  // Reset when categoryId changes
  useEffect(() => {
    setStartups([]);
    setPage(1);
    setHasMore(true);
    fetchStartups(1, true);
  }, [categoryId]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <Sidebar trendingIdeas={trendingIdeas} />
          </div>

          {/* Main Content */}
          <div className="col-span-6">
            {/* Post Creation */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-start space-x-3">
                <img src={unknownAvatar} className="w-12 h-12 rounded-full flex-shrink-0" alt="Avatar" />
                <div className="flex-1">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full text-left rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-600 transition hover:border-yellow-400 hover:bg-white"
                  >
                    <div className="text-base font-medium text-gray-700">Bạn có ý tưởng gì mới?</div>
                    <p className="text-sm text-gray-400 mt-1">Chia sẻ cảm hứng khởi nghiệp để nhận góp ý từ cộng đồng</p>
                  </button>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="flex items-center space-x-1 rounded-full border border-gray-200 px-3 py-1 text-xs">
                        <Users className="w-4 h-4" />
                        <span>AI hỗ trợ</span>
                      </span>
                      <span className="flex items-center space-x-1 rounded-full border border-gray-200 px-3 py-1 text-xs">
                        <Share2 className="w-4 h-4" />
                        <span>Công khai</span>
                      </span>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-2 bg-yellow-400 text-white rounded-full font-medium hover:bg-yellow-500"
                    >
                      Tạo bài viết
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {/* Shared Posts */}
              {sharedPosts.map((post) => (
                <StartUpCard key={`shared-${post.id}`} {...post} />
              ))}

              {/* Regular Startup Posts */}
              {startups.map((startup) => (
                <StartUpCard key={startup.id} startup={startup} />
              ))}
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              </div>
            )}

            {/* End of Posts Message */}
            {!hasMore && startups.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Hết bài viết cho bạn</p>
              </div>
            )}

            {/* No Posts Message */}
            {!isLoading && startups.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">Chưa có bài viết nào</p>
              </div>
            )}

            {/* Intersection Observer Target */}
            <div ref={observerTarget} className="h-4" />
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3">
            <SuggestFollow suggestions={suggestions} />
          </div>
        </div>
      </div>

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
      />
      <FivePartPostModal
        isOpen={showFivePartModal}
        onClose={() => {
          setShowFivePartModal(false);
          setInitialPostData(null);
        }}
        onSubmit={handleFivePartSubmit}
        onAiEvaluate={handleAiEvaluate}
        initialData={initialPostData?.formattedData}
        initialScore={initialPostData?.score}
      />
    </Layout>
  );
}