// import { useEffect } from "react";
// import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// import { APP_ROUTES } from "../constant";
// import Home from "../pages/Home";
// import Profile from "../pages/Profile";

// const UserRoute = () => {
//   const location = useLocation()

//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   }, [location.pathname]);

//   return (
//     <div className="min-h-screen flex flex-col">
//       <div className="flex-1 bg-gray-50">
//         <Routes>
//           <Route path={APP_ROUTES.HOME} element={<Home />} />
//           <Route path={APP_ROUTES.PROFILE(":userId")} element={<Profile />} />
          
//           <Route path="*" element={<Navigate to={APP_ROUTES.HOME} replace />} />
//         </Routes>
//       </div>
//     </div>
//   );
// };

// export default UserRoute;