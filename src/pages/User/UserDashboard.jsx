import React, { useContext, useEffect, useState } from 'react';
import {
  UserCircleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { SharedDataContext } from '../../contexts/SharedDataContext';
import { calculateMembershipDetails } from '../../utils/calculateMembershipDetails';

const UserDashboard = () => {

  const { currentUser, isLoading } = useContext(SharedDataContext);

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (currentUser) {
      const fullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();

      const membershipInfo = calculateMembershipDetails(
        currentUser.membership?.membershipStartDate,
        currentUser.membership?.membershipDurationDays
      );

      setUserData({
        name: fullName,
        email: currentUser.email,
        plan: currentUser.membership?.planName || 'Sin plan',
        membershipStatus: membershipInfo.status,
        memberSince: currentUser.membership?.membershipStartDate || null,
        remainingDays: membershipInfo.remainingDays,
      });
    }
  }, [currentUser]);

  const getMembershipStatusColor = (status) => {
    return status === 'Activa' || status === 'Active'
      ? 'text-green-400'
      : 'text-red-500';
  };


  if (isLoading || !userData) {
    return <div className="text-center text-white mt-8">Cargando datos del usuario...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold text-white mb-8">¡Bienvenido, {userData.name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Perfil */}
        <div className="bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg transition-all duration-150 transform hover:scale-105 min-h-[180px]">
          <div className="flex items-center mb-4">
            <UserCircleIcon className="h-10 w-10 text-orange-500 mr-3" />
            <h2 className="text-xl font-semibold text-orange-400">Mi Perfil</h2>
          </div>
          <p className="mb-2"><strong>Nombre:</strong> {userData.name}</p>
          <p className="mb-2"><strong>Email:</strong> {userData.email}</p>
          <p className="mb-2"><strong>Plan:</strong> {userData.plan}</p>
        </div>

        {/* Card Membresía */}
        <div className="bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg transition-all duration-150 transform hover:scale-105 min-h-[180px]">
          <div className="flex items-center mb-4">
            <CalendarDaysIcon className="h-10 w-10 text-orange-500 mr-3" />
            <h2 className="text-xl font-semibold text-orange-400">Mi Membresía</h2>
          </div>
          <p className="mb-2">
            <strong>Estado:</strong>{' '}
            <span className={`font-bold ${getMembershipStatusColor(userData.membershipStatus)}`}>
              {userData.membershipStatus}
            </span>
          </p>

          {userData.remainingDays !== null && userData.membershipStatus === 'Activa' && (
            <p className="mb-2">
              <strong>Días restantes:</strong> {userData.remainingDays} día{userData.remainingDays !== 1 ? 's' : ''}
            </p>
          )}

          {userData.membershipStatus === 'Vencida' && (
            <button className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              Renovar Membresía
            </button>
          )}
        </div>

        {/* Card Clases futuras (placeholder por ahora) */}
        <div className="bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg transition-all duration-150 transform hover:scale-105 min-h-[180px]">
          <div className="flex items-center mb-4">
            <SparklesIcon className="h-10 w-10 text-orange-500 mr-3" />
            <h2 className="text-xl font-semibold text-orange-400">Actividad Reciente</h2>
          </div>
          <p className="mb-2">Tienes <strong>{userData.upcomingClasses}</strong> clases programadas.</p>
          <button className="mt-2 w-full bg-green-700 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg">
            Ver Mis Clases
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;