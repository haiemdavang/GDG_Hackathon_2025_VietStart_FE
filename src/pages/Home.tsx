import { Share2, Users } from 'lucide-react';
import { use, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import unknownAvatar from "../assets/unknown_avatar.jpg";
import CreatePostModal, { type CreatePostPayload } from '../components/CreatePostModal';
import FindMemberModal from '../components/findMember/findMemeberModal';
import FivePartPostModal, { type FivePartPostPayload } from '../components/FivePartPostModal';
import Sidebar from '../components/Home/Sidebar';
import SuggestFollow from '../components/Home/SuggestFollow';
import Layout from '../components/Layout';
import StartUpCard from '../components/StartUpCard';
import type { MemberProfile } from '../data/ProfileData';
import { sharedPosts } from '../data/SharedPostsData';
import { suggestions } from '../data/SuggestionsData';
import { trendingIdeas } from '../data/TrendingIdeasData';
import StartupService from '../service/StartupService';
import showErrorNotification from '../Toast/NotificationError';
import showSuccessNotification from '../Toast/NotificationSuccess';
import type { PointResponse } from '../types/GeminiType';
import type { CreateStartUpDto, StartUpDto, UserSuggestionDto } from '../types/StartupType';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

export default function VietStartLayout() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId');

  const [startups, setStartups] = useState<StartUpDto[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFivePartModal, setShowFivePartModal] = useState(false);
  const [showFindMemberModal, setShowFindMemberModal] = useState(false);
  const [initialPostData, setInitialPostData] = useState<CreatePostPayload | null>(null);
  const [createdStartupId, setCreatedStartupId] = useState<number | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);
  const pageSize = 10;

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const fetchStartups = async (pageNumber: number, isInitial: boolean = false) => {
    if (isLoading || (!hasMore && !isInitial)) return;

    try {
      setIsLoading(true);
      const categoryIdNum = categoryId ? parseInt(categoryId) : undefined;
      const response = await StartupService.getStartups(categoryIdNum, pageNumber, pageSize);
      const newStartups = response.data.data;

      if (newStartups.length === 0) {
        setHasMore(false);
      } else {
        setStartups(prev => isInitial ? newStartups : [...prev, ...newStartups]);
        if (newStartups.length < pageSize) {
          setHasMore(false);
        }
      }
    } catch (error: any) {
      showErrorNotification(
        'Lỗi tải dữ liệu',
        error.message || 'Không thể tải danh sách bài viết'
      );
    } finally {
      setIsLoading(false);
    }
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

    try {
      showSuccessNotification(
        'Đang tạo bài viết',
        'Vui lòng chờ...'
      );

      const privacy = initialPostData.visibility === 'public' ? 1 : 0;

      const createDto: CreateStartUpDto = {
        team: payload.team,
        idea: payload.idea,
        prototype: payload.prototype,
        plan: payload.plan,
        relationship: payload.relationship,
        privacy: privacy,
        point: score?.TotalScore || 0,
        categoryId: initialPostData.categoryId,
        ideaPoint: score?.Idea || 0,
        prototypePoint: score?.Prototype || 0,
        planPoint: score?.Plan || 0,
        relationshipPoint: score?.Relationships || 0,
        teamPoint: score?.Team || 0
      };

      const response = await StartupService.createStartup(createDto);

      setShowFivePartModal(false);
      setInitialPostData(null);

      setStartups(prev => [response.data, ...prev]);

      showSuccessNotification(
        'Tạo bài viết thành công',
        'Ý tưởng của bạn đã được đăng!'
      );

      // Show FindMemberModal after successful post creation
      setCreatedStartupId(response.data.id);
      setShowFindMemberModal(true);
    } catch (error: any) {
      showErrorNotification(
        'Lỗi tạo bài viết',
        error.message || 'Không thể tạo bài viết. Vui lòng thử lại!'
      );
    }
  };

  const handleAiEvaluate = (payload: FivePartPostPayload) => {
    console.log('AI Evaluate payload:', payload);
  };

  const handleSelectMember = (member: UserSuggestionDto) => {
    
    // TODO: Add logic to invite member
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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <Sidebar trendingIdeas={trendingIdeas} />
          </div>

          {/* Main Content */}
          <div className="col-span-1 lg:col-span-6">
            {/* Post Creation */}
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <img src={currentUser?.avatar || unknownAvatar} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0" alt="Avatar" />
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full text-left rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-4 text-gray-600 transition hover:border-yellow-400 hover:bg-white"
                  >
                    <div className="text-sm sm:text-base font-medium text-gray-700">Bạn có ý tưởng gì mới?</div>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1 hidden sm:block">Chia sẻ cảm hứng khởi nghiệp để nhận góp ý từ cộng đồng</p>
                  </button>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 gap-2 sm:gap-0">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="flex items-center space-x-1 rounded-full border border-gray-200 px-2 sm:px-3 py-1 text-xs">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">AI hỗ trợ</span>
                        <span className="sm:hidden">AI</span>
                      </span>
                      <span className="flex items-center space-x-1 rounded-full border border-gray-200 px-2 sm:px-3 py-1 text-xs">
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Công khai</span>
                        <span className="sm:hidden">Public</span>
                      </span>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-yellow-400 text-white rounded-full text-sm font-medium hover:bg-yellow-500"
                    >
                      Tạo bài viết
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4 sm:space-y-6">
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
              <div className="flex justify-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              </div>
            )}

            {/* End of Posts Message */}
            {!hasMore && startups.length > 0 && (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <p className="text-sm">Hết bài viết cho bạn</p>
              </div>
            )}

            {/* No Posts Message */}
            {!isLoading && startups.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
                <p className="text-gray-500">Chưa có bài viết nào</p>
              </div>
            )}

            {/* Intersection Observer Target */}
            <div ref={observerTarget} className="h-4" />
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
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
      <FindMemberModal
        isOpen={showFindMemberModal}
        onClose={() => {
          setShowFindMemberModal(false);
          setCreatedStartupId(null);
        }}
        startupId={createdStartupId}
        onSelectMember={handleSelectMember}
      />
    </Layout>
  );
}