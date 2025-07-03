import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import HeaderUser from './components/User/HeaderUser';
import SidebarUser from './components/User/SidebarUser';
import Footer from './components/Footer'; // Assuming Footer.jsx is the shared footer

// Pages for User Panel
import UserDashboard from './pages/User/UserDashboard';
import UserClasses from './pages/User/UserClasses';
import UserMyClasses from './pages/User/UserMyClasses';
import UserMembership from './pages/User/UserMembership';
import UserFeedback from './pages/User/UserFeedback';

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderUser />
      <div className="flex flex-1">
        <SidebarUser />
        <main className="flex-1 bg-black text-white p-6 pb-28 md:pb-6 overflow-y-auto">
          <Outlet /> {/* Content of the current route will be rendered here */}
        </main>
      </div>
      <Footer />
    </div>
  );
};

const AppUser = () => {
  // Simulate user login check - in a real app, this would involve auth context or similar
  // For now, we assume the user is logged in if they reach AppUser.
  // const isLoggedIn = localStorage.getItem('userToken'); // Or some other check
  // if (!isLoggedIn) {
  //   return <Navigate to="/login" />; // Redirect to login if not authenticated
  // }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="clases" element={<UserClasses />} />
          <Route path="mis-clases" element={<UserMyClasses />} />
          <Route path="mi-membresia" element={<UserMembership />} />
          <Route path="feedback" element={<UserFeedback />} />
          {/* Catch-all route for user panel - can redirect to dashboard or a 404 specific to user panel */}
          <Route path="*" element={<UserDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppUser;
