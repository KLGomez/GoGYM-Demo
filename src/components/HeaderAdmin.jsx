import { Link, useNavigate } from "react-router-dom";
import { PowerIcon } from "@heroicons/react/24/outline";

const HeaderAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aca limpia el localStorage o lo que sea que vayamos a usar
    console.log("Cerrando sesión...");
    // Redirigir al login o home
    navigate("/login"); // o "/"
  };

  return (
    <header className="bg-gray-900 text-white flex justify-between items-center px-6 py-4 shadow z-50">
      {/* Logo como link a la página principal del admin */}
      <Link to="/" className="text-2xl font-bold text-orange-400 hover:bg-auto">
        GOGYM
      </Link>

      <div className="flex items-center gap-2 text-sm text-gray-200">
        <span>ADMIN</span>
        <button
          onClick={handleLogout}
          className="hover:text-orange-300 cursor-pointer transition-transform transform hover:scale-110"
          title="Cerrar sesión"
        >
          <PowerIcon className="w-6 h-6 text-orange-400" />
        </button>
      </div>
    </header>
  );
};

export default HeaderAdmin;
