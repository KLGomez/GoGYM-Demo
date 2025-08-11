import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PowerIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import { SharedDataContext } from '../contexts/SharedDataContext';
import { confirmAction, showSuccess } from '../utils/alerts';

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useContext(SharedDataContext);

  const isAdmin = currentUser?.role === 'admin';
  const displayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
    : isAdmin
      ? 'Admin'
      : 'Usuario';

  const handleLogout = () => {
    confirmAction(
      'logout',
      { firstName: currentUser?.firstName, email: currentUser?.email },
      'Sí, cerrar sesión',
      async () => {
        logoutUser();
        showSuccess('logout', { firstName: currentUser?.firstName, email: currentUser?.email });
        navigate('/login');
      }
    );
  };



  const dashboardPath = isAdmin ? '/admin' : '/user';

  return (
    <header className="bg-gray-900 text-white flex justify-between items-center px-6 py-4 shadow-md z-50">
      <Link to={dashboardPath} className="flex items-center space-x-2">
        <div className="text-xl font-bold">
          <span className="text-orange-500 dark:text-orange-400">Go</span>Gym
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <UserCircleIcon className="h-7 w-7 text-orange-400" />
          <span className="hidden sm:inline text-lg font-medium text-orange-300">
            {displayName}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="hover:text-orange-300 cursor-pointer transition-transform transform hover:scale-105 flex items-center gap-1 p-2 rounded-md hover:bg-gray-700"
          title="Cerrar sesión"
        >
          <PowerIcon className="w-6 h-6 text-orange-400" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
