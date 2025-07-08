import { Link, useNavigate } from "react-router-dom";
import { PowerIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";

const HeaderAdmin = () => {
  const navigate = useNavigate();

  // Obtener nombre del admin desde localStorage
  const adminDataString = localStorage.getItem("currentUser");
  let adminName = "Admin";
  if (adminDataString) {
    try {
      const adminData = JSON.parse(adminDataString);
      adminName = adminData.name || adminData.email || "Admin";
    } catch (error) {
      console.error("Error al obtener el nombre del admin:", error);
    }
  }

  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tu sesión se cerrará y deberás volver a iniciar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F26419",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      background: "#1f2937",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("loggedUser"); // Changed from currentUser to loggedUser
        // Kept these in case they are used elsewhere, or for future use.
        // If they are definitively not used, they can be removed.
        localStorage.removeItem("userToken");
        localStorage.removeItem("userRole");
        navigate("/login"); // Navigate to /login, which shows the Login page
      }
    });
  };

  return (
    <header className="bg-gray-900 text-white flex justify-between items-center px-6 py-4 shadow z-50">
      {/* Reemplazamos el logo por el nombre del admin */}
      <div className="flex items-center gap-3">
        <UserCircleIcon className="h-7 w-7 text-orange-400" />
        <span className="text-lg font-semibold text-orange-300">{adminName}</span>
      </div>

      <button
        onClick={handleLogout}
        className="hover:text-orange-300 cursor-pointer transition-transform transform hover:scale-110"
        title="Cerrar sesión"
      >
        <PowerIcon className="w-6 h-6 text-orange-400" />
      </button>
    </header>
  );
};

export default HeaderAdmin;
