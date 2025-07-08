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

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/check-in',
    element: <CheckInPage />,
  },
  {
    path: '/admin',
    element: <AppAdmin />,
    children: adminRoutes, // Nested admin routes
  },
  {
    path: '/user',
    element: <AppUser />,
    children: userRoutes, // Nested user routes
  },
  {
    path: '*', // Catch-all for not found routes
    element: <NotFoundPage />,
  },
  // TODO: Add a root path '/' if needed, for example, redirecting to login or a landing page.
  // {
  //   path: '/',
  //   element: <HomePage />, // Or redirect to /login
  // }
]);

export default router;
