import { Link, useNavigate } from "react-router-dom";
import { PowerIcon } from "@heroicons/react/24/outline";
// import Swal from "sweetalert2"; // ELIMINAR ESTA LÍNEA, ya no se usa directamente aquí
import { confirmAction } from "../utils/alerts"; // Asegúrate que la ruta sea correcta

const HeaderAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Se llama a la función confirmAction de nuestro módulo de alertas
    confirmAction(
      "¿Cerrar sesión?", // Título de la alerta
      "Tu sesión se cerrará y deberás volver a iniciar.", // Texto descriptivo
      () => { // Esta es la función callback que se ejecuta si el usuario confirma
        console.log("Sesión cerrada.");
        // Aquí puedes agregar lógica para limpiar datos de sesión si es necesario
        // (ej. localStorage.removeItem('userData'))
        navigate("/login"); // Redirige al login
      },
      "Sí, cerrar sesión", // Texto para el botón de confirmación
      "Cancelar" // Texto para el botón de cancelar
    );
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