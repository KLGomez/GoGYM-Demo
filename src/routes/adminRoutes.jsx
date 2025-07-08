import ArticlesAdmin from '../pages/ArticlesAdmin';
import ClassesAdmin from '../pages/ClassesAdmin';
import MembershipsAdmin from '../pages/MembershipsAdmin';
import ClientsAdmin from '../pages/ClientesAdmin';
import HomePage from '../pages/HomePage'; // Used for admin dashboard and check-in

const adminRoutes = [
  {
    index: true, // Corresponds to /admin
    element: <HomePage />,
  },
  {
    path: 'check-in', // Corresponds to /admin/check-in
    element: <HomePage />,
  },
  {
    path: 'articles', // Corresponds to /admin/articles
    element: <ArticlesAdmin />,
  },
  {
    path: 'classes', // Corresponds to /admin/classes
    element: <ClassesAdmin />,
  },
  {
    path: 'memberships', // Corresponds to /admin/memberships
    element: <MembershipsAdmin />,
  },
  {
    path: 'clients', // Corresponds to /admin/clients
    element: <ClientsAdmin />,
  },
  // Add other admin-specific routes here
  // Example:
  // {
  //   path: 'settings',
  //   element: <AdminSettingsPage />,
  // },
];

export default adminRoutes;
