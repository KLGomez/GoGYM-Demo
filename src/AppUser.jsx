import React from 'react';
import { Outlet } from 'react-router-dom'; // Outlet is already used, ensure Router/Routes are removed from AppUser
import HeaderUser from './components/User/HeaderUser';
import SidebarUser from './components/User/SidebarUser';
import Footer from './components/Footer'; // Assuming Footer.jsx is the shared footer

// Page imports are no longer needed here as they are handled by userRoutes.jsx

// UserLayout remains the same, as it correctly uses <Outlet />
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

// AppUser itself no longer needs to define routes or use Router.
// It will be used as the element for the '/user' path in the main router,
// and UserLayout will be rendered, which in turn renders child routes via <Outlet />.
// For clarity, we can rename AppUser to UserFeatureWrapper or similar,
// or simply export UserLayout directly if AppUser doesn't do anything else.
// For now, let's assume AppUser might have other logic in the future (e.g., auth checks for /user path).
// So, AppUser will just render UserLayout.
// The router configuration in src/routes/index.jsx already specifies AppUser as the element for '/user',
// which means UserLayout (returned by AppUser) will be rendered, and userRoutes will populate its <Outlet />.

const AppUser = () => {
  // User-specific logic (like auth checks for /user path) could go here in a real app.
  // For this refactor, AppUser's role is simplified.
  // It's the component associated with the '/user' path segment.
  // The actual layout and child routes are handled by UserLayout and userRoutes.jsx.

  // The crucial part is that `src/routes/index.jsx` has:
  // {
  //   path: '/user',
  //   element: <AppUser />, // This AppUser component
  //   children: userRoutes,
  // }
  // And AppUser should render the component that contains the <Outlet /> for userRoutes.
  // In this case, it's UserLayout.

  return <UserLayout />;
};

export default AppUser;
