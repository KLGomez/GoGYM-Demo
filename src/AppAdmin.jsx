import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/SidebarAdmin"; // Asegurate que este archivo exista
import ArticlesAdmin from "./pages/ArticlesAdmin";
import ClassesAdmin from "./pages/ClassesAdmin";
import MembershipsAdmin from "./pages/MembershipsAdmin";
import ClientsAdmin from "./pages/ClientesAdmin";
import HeaderAdmin from "./components/HeaderAdmin";
import FooterAdmin from "./components/Footer";

function AppAdmin() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <HeaderAdmin />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 bg-black text-white min-h-screen">
            <Routes>
              <Route path="/articles" element={<ArticlesAdmin />} />
              <Route path="/classes" element={<ClassesAdmin />} />
              <Route path="/memberships" element={<MembershipsAdmin />} />
              <Route path="/clients" element={<ClientsAdmin />} />
            </Routes>
          </main>
        </div>
      </div>
          <FooterAdmin />
    </Router>
  );
}

export default AppAdmin;
