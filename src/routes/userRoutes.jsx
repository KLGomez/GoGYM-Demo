import UserDashboard from '../pages/User/UserDashboard';
import UserClasses from '../pages/User/UserClasses';
import UserMyClasses from '../pages/User/UserMyClasses';
import UserMembership from '../pages/User/UserMembership';
import UserFeedback from '../pages/User/UserFeedback';
import UserMyQRPage from '../pages/User/UserMyQR'; // Importar la nueva página

const userRoutes = [
  {
    index: true, // Corresponds to /user
    element: <UserDashboard />,
  },
  {
    path: 'clases', // Corresponds to /user/clases
    element: <UserClasses />,
  },
  {
    path: 'mis-clases', // Corresponds to /user/mis-clases
    element: <UserMyClasses />,
  },
  {
    path: 'mi-membresia', // Corresponds to /user/mi-membresia
    element: <UserMembership />,
  },
  {
    path: 'mi-qr', // Nueva ruta para el QR del usuario
    element: <UserMyQRPage />,
  },
  {
    path: 'feedback', // Corresponds to /user/feedback
    element: <UserFeedback />,
  },
  {
    path: '*', // Catch-all for any other path under /user
    element: <UserDashboard />, // Or a specific UserNotFoundPage
  },
  // Add other user-specific routes here
];

export default userRoutes;
