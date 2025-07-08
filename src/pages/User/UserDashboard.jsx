import React, { useEffect, useState } from 'react';
import { UserCircleIcon, EnvelopeIcon, ShieldCheckIcon, CalendarDaysIcon, SparklesIcon } from '@heroicons/react/24/outline';

const UserDashboard = () => {
  const [userData, setUserData] = useState({
    name: 'Usuario Ejemplo',
    email: 'usuario@ejemplo.com',
    plan: 'Plan Premium',
    membershipStatus: 'Activa', // 'Activa' o 'Vencida'
    memberSince: '2023-01-15',
    upcomingClasses: 2, // Número de clases próximas
  });

  // Simular la carga de datos del usuario desde localStorage o una API
  useEffect(() => {
    const storedUserData = localStorage.getItem('currentUser');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(prevData => ({
          ...prevData, // Mantener valores por defecto si no están en localStorage
          name: parsedData.name || prevData.name,
          email: parsedData.email || prevData.email,
          plan: parsedData.plan || prevData.plan, // Asumiendo que 'plan' podría estar en los datos del usuario
          membershipStatus: parsedData.membershipStatus || prevData.membershipStatus, // Asumiendo
        }));
      } catch (error) {
        console.error("Error parsing user data from localStorage for dashboard:", error);
      }
    }
  }, []);

  const getMembershipStatusColor = (status) => {
    return status === 'Activa' ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold text-white mb-8">Bienvenido, {userData.name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Información Personal */}
        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <UserCircleIcon className="h-10 w-10 text-orange-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-700">Mi Perfil</h2>
          </div>
          <div className="space-y-3 text-gray-600">
            <p className="flex items-center"><UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" /> <strong>Nombre:</strong> {userData.name}</p>
            <p className="flex items-center"><EnvelopeIcon className="h-5 w-5 mr-2 text-gray-400" /> <strong>Email:</strong> {userData.email}</p>
            <p className="flex items-center"><ShieldCheckIcon className="h-5 w-5 mr-2 text-gray-400" /> <strong>Plan Actual:</strong> {userData.plan}</p>
          </div>
        </div>

        {/* Tarjeta de Estado de Membresía */}
        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <CalendarDaysIcon className="h-10 w-10 text-orange-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-700">Mi Membresía</h2>
          </div>
          <div className="space-y-3 text-gray-600">
            <p className="flex items-center">
              <ShieldCheckIcon className={`h-5 w-5 mr-2 ${getMembershipStatusColor(userData.membershipStatus)}`} />
              <strong>Estado:</strong> <span className={`font-bold ${getMembershipStatusColor(userData.membershipStatus)}`}>{userData.membershipStatus}</span>
            </p>
            <p><strong>Miembro desde:</strong> {new Date(userData.memberSince).toLocaleDateString()}</p>
            {/* Podría añadirse fecha de vencimiento si estuviera disponible */}
            {userData.membershipStatus === 'Vencida' && (
              <button className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                Renovar Membresía
              </button>
            )}
          </div>
        </div>

        {/* Tarjeta de Próximas Clases (Ejemplo) */}
        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <SparklesIcon className="h-10 w-10 text-orange-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-700">Actividad Reciente</h2>
          </div>
          <div className="space-y-3 text-gray-600">
            <p>Tienes <strong>{userData.upcomingClasses}</strong> clases programadas esta semana.</p>
            <button className="mt-2 w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                Ver Mis Clases
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
