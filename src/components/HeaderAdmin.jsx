import React, { useContext } from 'react'; // Importar useContext
import { useNavigate, Link } from "react-router-dom"; // Importar Link para el logo si se desea
import { PowerIcon, UserCircleIcon } from "@heroicons/react/24/outline";
// Swal ya no es necesario aquí, el contexto lo maneja.
// import Swal from "sweetalert2";
import { SharedDataContext } from '../contexts/SharedDataContext'; // Corregir ruta de importación

const HeaderAdmin = () => {
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useContext(SharedDataContext); // Usar el contexto

  // Obtener nombre del admin desde currentUser del contexto
  const adminName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : "Admin";

  const handleLogout = () => {
    logoutUser(); // Llama a la función de logout del contexto
    // La redirección a /login ya está manejada en AppAdmin.jsx o en el propio logoutUser si se configuró así.
    // Pero por si acaso, o para asegurar, se puede dejar:
    navigate("/login");
  };

  return (
    <header className="bg-gray-900 text-white flex justify-between items-center px-6 py-4 shadow z-50">
      <Link to="/admin" className="flex items-center gap-3"> {/* Enlace al dashboard del admin */}
        <UserCircleIcon className="h-7 w-7 text-orange-400" />
        <span className="text-lg font-semibold text-orange-300">{adminName}</span>
      </Link>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 hover:text-orange-300 cursor-pointer transition-transform transform hover:scale-105"
        title="Cerrar sesión"
      >
        <PowerIcon className="w-6 h-6 text-orange-400" />
        <span className="hidden sm:inline">Cerrar Sesión</span>
      </button>
    </header>
  );
};

export default HeaderAdmin;
