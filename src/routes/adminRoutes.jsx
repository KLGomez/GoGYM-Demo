import ArticlesAdmin from '../pages/ArticlesAdmin';
import ClassesAdmin from '../pages/ClassesAdmin';
import MembershipsAdmin from '../pages/MembershipsAdmin';
import ClientsAdmin from '../pages/ClientesAdmin'; // Ya usa contexto
import HomePage from '../pages/HomePage'; // Usado para dashboard admin y check-in
import ManageClassesView from '../pages/ManageClassesView'; // Ya usa contexto
import ManageTeachersView from '../pages/ManageTeachersView'; // Ya usa contexto
import EnrollStudentsView from '../pages/EnrollStudentsView'; // Ya usa contexto
import ScheduleView from '../pages/ScheduleView'; // Ya usa contexto
import AttendanceView from '../pages/AttendanceView'; // Ya usa contexto


// NOTA: ClassesAdmin.jsx actúa como un router interno para sus subvistas.
// Las rutas directas a las subvistas (ManageClassesView, etc.) podrían definirse aquí
// o mantener la lógica de navegación dentro de ClassesAdmin.jsx.
// Por ahora, ClassesAdmin maneja su propia navegación interna a esas vistas.

const adminRoutes = [
  {
    index: true, // Corresponds to /admin
    element: <HomePage />, // Dashboard del Admin
  },
  {
    path: 'check-in', // Esta ruta podría ser redundante si HomePage ya maneja el check-in,
                      // o podría ser una versión específica del check-in para el admin.
                      // La CheckInPage.jsx general es /check-in (ruta raíz).
    element: <HomePage />, // O un componente específico de CheckInAdmin si es diferente
  },
  {
    path: 'articles',
    element: <ArticlesAdmin />, // Placeholder
  },
  {
    path: 'classes/*', // Permite que ClassesAdmin maneje sus propias sub-rutas si las tuviera definidas con <Routes>
    element: <ClassesAdmin />,
    // Si ClassesAdmin NO usa <Routes> sino estado local para cambiar vistas, entonces no necesita '/*'.
    // Revisando ClassesAdmin.jsx, usa estado local (currentView), así que 'classes' es suficiente.
    // path: 'classes', (corregido abajo)
  },
  {
    path: 'classes', // Ruta principal para la gestión de clases y sus subvistas internas
    element: <ClassesAdmin />,
    // Las subvistas como ManageClassesView, ScheduleView, etc., son renderizadas DENTRO de ClassesAdmin.
    // Si quisiéramos rutas directas como /admin/classes/manage, la estructura sería diferente aquí
    // y ClassesAdmin tendría un <Outlet />. Por ahora, se mantiene la lógica interna de ClassesAdmin.
  },
  {
    path: 'memberships',
    element: <MembershipsAdmin />, // Refactorizado para mostrar estado de membresías
  },
  {
    path: 'clients',
    element: <ClientsAdmin />, // Ya refactorizado
  },
  // Podríamos añadir rutas explícitas para las subvistas de ClassesAdmin si se quisiera acceso directo
  // y se refactoriza ClassesAdmin para usar <Outlet />. Ejemplo:
  // { path: 'classes/manage', element: <ManageClassesView /> },
  // { path: 'classes/schedule', element: <ScheduleView /> },
  // etc.
  // Pero dado que el plan es refactorizar las vistas que ClassesAdmin ya llama,
  // mantener la lógica de navegación dentro de ClassesAdmin es consistente con su diseño actual.
];

export default adminRoutes;
