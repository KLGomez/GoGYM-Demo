import React, { useContext } from 'react'; // Importar useContext
import { useNavigate, Link } from 'react-router-dom'; // Importar Link
import { PowerIcon, UserCircleIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
// SweetAlert para logout ya está en el contexto (logoutUser), no es necesario aquí.
// import Swal from 'sweetalert2';
import { SharedDataContext } from '../../contexts/SharedDataContext'; // Importar el contexto

// Asumimos que el toggle de DarkMode se manejará a un nivel superior o no se incluye en este Header específico.
// Si se necesita, se puede añadir similar a como se hizo en la versión anterior del plan.

const HeaderUser = () => {
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useContext(SharedDataContext); // Usar el contexto

  const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : 'Usuario';

  const handleLogout = () => {
    logoutUser(); // Llama a la función de logout del contexto (que ya usa SweetAlert)
    navigate('/login'); // Redirige a login después del logout
  };

  // TODO: Implementar Dark Mode si es necesario, similar a la propuesta anterior.
  // const [isDarkMode, setIsDarkMode] = useState(...);
  // const toggleDarkMode = () => { ... };

  return (
    <header className="bg-gray-900 text-white flex justify-between items-center px-6 py-4 shadow z-50">
      {/* Logo o nombre del sitio, enlazando al dashboard del usuario */}
      <Link to="/user" className="flex items-center space-x-2">
        <div className="text-xl font-bold">
          <span className='text-orange-500 dark:text-orange-400'>Go</span>Gym
        </div>
      </Link>

      <div className="flex items-center gap-4">
        {/* <button onClick={toggleDarkMode} title="Cambiar tema" className="p-2 rounded-full hover:bg-gray-700">
          {isDarkMode ? <SunIcon className="h-6 w-6 text-yellow-400" /> : <MoonIcon className="h-6 w-6 text-gray-300" />}
        </button> */}
        <div className="flex items-center gap-2">
            <UserCircleIcon className="h-7 w-7 text-orange-400" />
            <span className="text-lg font-medium">{userName}</span>
        </div>
        <button
          onClick={handleLogout}
          className="hover:text-orange-300 cursor-pointer transition-transform transform hover:scale-110 flex items-center gap-1 p-2 rounded-md hover:bg-gray-700"
          title="Cerrar sesión"
        >
          <PowerIcon className="w-6 h-6 text-orange-400" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
};

export default HeaderUser;
