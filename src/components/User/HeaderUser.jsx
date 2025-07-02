// Contenido inicial para HeaderUser.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const HeaderUser = () => {
  const navigate = useNavigate();
  // Lógica para obtener nombre de usuario y logout aquí
  // En una aplicación real, el nombre de usuario podría venir de un contexto o estado global post-login.
  const userDataString = localStorage.getItem('currentUser'); // Asumiendo que el objeto de usuario se guarda como 'currentUser'
  let userName = 'Usuario';
  if (userDataString) {
    try {
      const userData = JSON.parse(userDataString);
      userName = userData.name || userData.email || 'Usuario'; // Priorizar nombre, luego email
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
  }


  const handleLogout = () => {
    console.log('Logout');
    // Limpiar datos de sesión del usuario
    localStorage.removeItem('currentUser'); // O cualquier otra key que se use para la sesión
    localStorage.removeItem('userToken'); // Si se usa un token
    localStorage.removeItem('userRole'); // Si se guarda el rol
    // Redirigir al login
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <UserCircleIcon className="h-8 w-8 mr-2 text-orange-400" />
        <span className="text-xl font-semibold">{userName}</span>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center text-orange-400 hover:text-orange-500"
      >
        <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-1" />
        Salir
      </button>
    </header>
  );
};

export default HeaderUser;
