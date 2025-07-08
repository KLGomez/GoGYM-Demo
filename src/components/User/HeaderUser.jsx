import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PowerIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

const HeaderUser = () => {
  const navigate = useNavigate();

  // Obtener datos del usuario
  const userDataString = localStorage.getItem('currentUser');
  let userName = 'Usuario';
  if (userDataString) {
    try {
      const userData = JSON.parse(userDataString);
      userName = userData.name || userData.email || 'Usuario';
    } catch (error) {
      console.error("Error al leer usuario del localStorage:", error);
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
        localStorage.removeItem("currentUser");
        localStorage.removeItem("userToken");
        localStorage.removeItem("userRole");
        navigate("/login");
      }
    });
  };

  return (
    <header className="bg-gray-900 text-white flex justify-between items-center px-6 py-4 shadow z-50">
      <div className="flex items-center gap-3">
        <UserCircleIcon className="h-7 w-7 text-orange-400" />
        <span className="text-lg font-medium">{userName}</span>
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

export default HeaderUser;
