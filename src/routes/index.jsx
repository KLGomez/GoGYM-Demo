import { createBrowserRouter } from 'react-router-dom';

// Import general page components
import Login from '../pages/Login.jsx'; // Changed from LoginPage to Login
import CheckInPage from '../pages/CheckInPage';
import NotFoundPage from '../pages/NotFoundPage';

// Import App layouts
import AppAdmin from '../AppAdmin.jsx';
import AppUser from '../AppUser.jsx';

// Import route configurations
import adminRoutes from './adminRoutes';
import userRoutes from './userRoutes';
// HomePage import removed as it's not directly used here anymore

const router = createBrowserRouter([
  {
    path: '/', // Root path now renders Login
    element: <Login />,
  },
  {
    path: '/login', // /login path also renders Login
    element: <Login />,
  },
  {
    path: '/check-in',
    element: <CheckInPage />,
  },
  {
    path: '/admin', // Admin path remains for direct access after login
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
