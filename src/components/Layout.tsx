import { Bell, ChevronDown, Mail, Search } from 'lucide-react';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import unknownAvatar from "../assets/unknown_avatar.jpg";
import { APP_ROUTES } from '../constant';
import AuthService from '../service/AuthService';
import UserService from '../service/UserService';
import { logout, setUser } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [showDropdown, setShowDropdown] = React.useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = AuthService.getCurrentUserId();
      if (userId && !user) {
        try {
          const response = await UserService.getUserProfile(userId);
          dispatch(setUser(response.data));
        } catch (error) {
          console.error('Error fetching user profile:', error);
          dispatch(logout());
          navigate(APP_ROUTES.LOGIN);
        }
      } else {
        // if (!user) {
        //   navigate(APP_ROUTES.LOGIN);
        // }
      }
    };

    fetchUserProfile();
  }, [user, dispatch, navigate]);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      dispatch(logout());
      navigate(APP_ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logout());
      navigate(APP_ROUTES.LOGIN);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#avatar') && !target.closest('.absolute')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(APP_ROUTES.HOME)}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <img src='/logo.png' className="w-5 h-5" alt="VietStart Logo" />
                </div>
                <span className="text-xl font-bold">VietStart</span>
              </button>
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm người, bài viết, startup..."
                    className="w-96 pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Mail className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-1"
                >
                  <img
                    src={user?.avatar || unknownAvatar}
                    className="w-8 h-8 rounded-full object-cover"
                    id="avatar"
                    alt={user?.fullName || 'User avatar'}
                  />
                  {user && (
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user.fullName}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {user && (
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate(APP_ROUTES.PROFILE(user?.id || ''));
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      Xem trang cá nhân
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
}
