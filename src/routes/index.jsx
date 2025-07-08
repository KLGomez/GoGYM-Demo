import { createBrowserRouter } from 'react-router-dom';

// Import general page components
import LoginPage from '../pages/LoginPage'; // Assuming you have a LoginPage component
import CheckInPage from '../pages/CheckInPage'; // Assuming you have a CheckInPage component
import NotFoundPage from '../pages/NotFoundPage'; // Assuming you have a NotFoundPage component

// Import App layouts
import AppAdmin from '../AppAdmin.jsx';
import AppUser from '../AppUser.jsx';

// Import route configurations
import adminRoutes from './adminRoutes';
import userRoutes from './userRoutes';
import HomePage from '../pages/HomePage'; // Ensure HomePage is imported if not already

const router = createBrowserRouter([
  {
    path: '/', // Root path now renders AppAdmin
    element: <AppAdmin />,
    children: adminRoutes, // AppAdmin's Outlet will render HomePage from adminRoutes (index: true)
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/check-in',
    element: <CheckInPage />,
  },
  {
    path: '/admin', // This path remains, effectively an alias to '/' for AppAdmin content
    element: <AppAdmin />,
    children: adminRoutes,
  },
  {
    path: '/user',
    element: <AppUser />,
    children: userRoutes,
  },
  {
    path: '*', // Catch-all for not found routes
    element: <NotFoundPage />,
  },
]);

export default router;
