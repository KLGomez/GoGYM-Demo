import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/SidebarAdmin";
import HeaderAdmin from "./components/HeaderAdmin";
import FooterAdmin from "./components/Footer";
import ArticlesAdmin from "./pages/ArticlesAdmin";
import ClassesAdmin from "./pages/ClassesAdmin";
import MembershipsAdmin from "./pages/MembershipsAdmin";
import ClientsAdmin from "./pages/ClientesAdmin";
import DashboardAdmin from "./pages/DashboardAdmin"; // Asegurar que DashboardAdmin esté importado
import HomePage from "./pages/HomePage"; // Importar HomePage

function AppAdmin() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen overflow-hidden">
        <HeaderAdmin />

        {/* Contenedor de contenido */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />

          <main className="flex-1 bg-black text-white p-6 pb-28 md:pb-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<DashboardAdmin />} /> {/* Ruta para el dashboard existente */}
              <Route path="/check-in" element={<HomePage />} /> {/* Nueva ruta para escaneo QR */}
              <Route path="/articles" element={<ArticlesAdmin />} />
              <Route path="/classes" element={<ClassesAdmin />} />
              <Route path="/memberships" element={<MembershipsAdmin />} />
              <Route path="/clients" element={<ClientsAdmin />} />
            </Routes>
          </main>
        </div>

        <FooterAdmin />
      </div>
    </Router>
  );
}

export default AppAdmin;
