import { Link, useNavigate } from "react-router-dom";
import { PowerIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";


const HeaderAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tu sesión se cerrará y deberás volver a iniciar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F26419",
      cancelButtonColor: "#6b7280", // gray-500
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      background: "#1f2937", // gray-800
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Sesión cerrada.");
        // Acá se podría limpiar los datos de sesión que podriamos usar localstorage
        navigate("/login");
      }
    });
  };

  return (
    <header className="bg-gray-900 text-white flex justify-between items-center px-6 py-4 shadow z-50">
      <Link to="/" className="text-2xl font-bold text-orange-400 hover:text-orange-500">
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
