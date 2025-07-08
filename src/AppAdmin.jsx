import { Outlet } from "react-router-dom"; // Import Outlet
import Sidebar from "./components/SidebarAdmin";
import HeaderAdmin from "./components/HeaderAdmin";
import FooterAdmin from "./components/Footer";
// Page imports are no longer needed here as they are handled by adminRoutes.jsx

function AppAdmin() {
  return (
    // <Router> component is removed, as routing is handled by createBrowserRouter in main.jsx
    <div className="flex flex-col min-h-screen overflow-hidden">
      <HeaderAdmin />

      {/* Contenedor de contenido */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 bg-black text-white p-6 pb-28 md:pb-6 overflow-y-auto">
          {/* <Routes> and <Route> components are removed */}
          {/* Outlet will render the matched child route from adminRoutes.jsx */}
          <Outlet />
        </main>
      </div>

      <FooterAdmin />
    </div>
    // </Router>
  );
}

export default AppAdmin;
