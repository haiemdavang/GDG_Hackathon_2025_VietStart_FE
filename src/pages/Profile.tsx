import { User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import EditProfileModal from '../components/EditProfileModal';
import Layout from '../components/Layout';
import ProfileCard from '../components/ProfileCard';
import StartUpCard from '../components/StartUpCard';
import { StartupService } from '../service/StartupService';
import type { RootState } from '../store/store';
import type { ProfileData } from '../types/profile.types';
import type { StartUpDto } from '../types/StartupType';

export default function Profile() {
  const { userId } = useParams<{ userId?: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    location: '',
    bio: '',
    avatar: '',
    dob: '',
  });
  const [userStartups, setUserStartups] = useState<StartUpDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Determine which user's profile to show
  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);

      try {
        // If viewing own profile and no userId in params, use currentUser data
        if (isOwnProfile && currentUser) {
          setProfileData({
            fullName: currentUser.fullName || '',
            location: currentUser.location || '',
            bio: currentUser.bio || '',
            avatar: currentUser.avatar || '',
            dob: currentUser.dob || '',
          });
        }

        // Fetch startups for target user
        if (targetUserId) {
          const response = await StartupService.getUserStartups(targetUserId);
          setUserStartups(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [targetUserId, currentUser, isOwnProfile]);

  const handleSaveProfile = (data: ProfileData) => {
    setProfileData(data);
    console.log('Saving profile:', data);
  };

  const handleVisibilityChange = (ideaId: number, isPublic: boolean) => {
    console.log(`Idea ${ideaId} visibility changed to:`, isPublic ? 'Public' : 'Private');
    // TODO: Call API to update visibility
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Left Sidebar - Profile Info */}
            <div className="col-span-1 lg:col-span-4">
              <div className="lg:sticky lg:top-20">
                <ProfileCard
                  profileData={profileData}
                  onEditClick={() => setIsModalOpen(true)}
                  ideasCount={userStartups.length}
                  showEditButton={isOwnProfile}
                  socialLinks={{
                    facebook: 'https://facebook.com',
                    twitter: 'https://twitter.com',
                    linkedin: 'https://linkedin.com',
                    github: 'https://github.com',
                    instagram: 'https://instagram.com'
                  }}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-1 lg:col-span-8">
              {/* Bio Section */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3">Giới thiệu</h3>
                <p className="text-sm sm:text-base text-gray-700">
                  {profileData.bio}
                </p>
              </div>

              {/* Ideas List */}
              <div className="mb-3 sm:mb-4">
                <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">Ý tưởng ({userStartups.length})</h3>
              </div>

              {isLoading ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-sm sm:text-base text-gray-500">Đang tải...</p>
                </div>
              ) : userStartups.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {userStartups.map((startup) => (
                    <StartUpCard
                      key={startup.id}
                      startup={startup}
                      avatarUrl={profileData.avatar}
                      isOwner={isOwnProfile}
                      onVisibilityChange={(isPublic) => handleVisibilityChange(startup.id, isPublic)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 text-center text-gray-500">
                  <div className="py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                      <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <p className="text-base sm:text-lg font-medium mb-2">Chưa có ý tưởng nào</p>
                    <p className="text-xs sm:text-sm px-4">
                      {isOwnProfile
                        ? 'Khi bạn chia sẻ ý tưởng, chúng sẽ xuất hiện ở đây'
                        : 'Người dùng này chưa chia sẻ ý tưởng nào'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <EditProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProfile}
          initialData={profileData}
        />
      )}
    </Layout>
  );
}