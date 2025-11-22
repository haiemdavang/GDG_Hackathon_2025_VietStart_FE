import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ButtonFunction from "../components/ButtonFunction";
import FindMemberModal from "../components/findMember/findMemeberModal";
import { APP_ROUTES } from "../constant";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Suggestion from "../pages/Suggestion";

const UserRoute = () => {
  const location = useLocation();
  const [isFindMemberModalOpen, setIsFindMemberModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-gray-50">
        <Routes>
          <Route path={APP_ROUTES.HOME} element={<Home />} />
          <Route path={APP_ROUTES.MY_POSTS} element={<Home />} />
          <Route path={APP_ROUTES.PROFILE(":userId")} element={<Profile />} />
          <Route path={APP_ROUTES.SUGGESTION} element={<Suggestion />} />

          <Route path="*" element={<Navigate to={APP_ROUTES.HOME} replace />} />
        </Routes>
      </div>

      <ButtonFunction
        onFindMember={() => setIsFindMemberModalOpen(true)}
        // onCreatePost={() => setIsCreatePostModalOpen(true)}
      />

      <FindMemberModal
        isOpen={isFindMemberModalOpen}
        onClose={() => setIsFindMemberModalOpen(false)}
        onSelectMember={(member) => {
          console.log('Selected member:', member);
          // Handle member selection logic here
        }}
      />

     
    </div>
  );
};

export default UserRoute;