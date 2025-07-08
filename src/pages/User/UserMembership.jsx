import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, CalendarDaysIcon, InformationCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline';

const UserMembership = () => {
  const [membershipData, setMembershipData] = useState({
    planName: 'Plan Premium Mensual',
    status: 'Activa', // 'Activa', 'Vencida', 'Próxima a vencer', 'Congelada'
    startDate: '2024-03-01',
    endDate: '2024-04-01',
    renewalDate: '2024-04-01',
    paymentMethod: 'Visa **** **** **** 1234',
    benefits: [
      'Acceso ilimitado a todas las clases',
      'Acceso a clases especiales online',
      'Descuento en tienda de suplementos',
      '1 invitado gratis por mes',
    ],
    autoRenew: true,
  });

  // Simular la carga de datos de membresía del usuario desde localStorage o una API
  useEffect(() => {
    const storedUserData = localStorage.getItem('currentUser'); // Suponiendo que la info de membresía está en currentUser
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        // Asumimos que el objeto de usuario podría tener una sub-sección 'membership'
        if (parsedData.membership) {
          setMembershipData(prevData => ({
            ...prevData,
            planName: parsedData.membership.planName || prevData.planName,
            status: parsedData.membership.status || prevData.status,
            startDate: parsedData.membership.startDate || prevData.startDate,
            endDate: parsedData.membership.endDate || prevData.endDate,
            renewalDate: parsedData.membership.renewalDate || prevData.renewalDate,
            paymentMethod: parsedData.membership.paymentMethod || prevData.paymentMethod,
            autoRenew: typeof parsedData.membership.autoRenew !== 'undefined' ? parsedData.membership.autoRenew : prevData.autoRenew,
          }));
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage for membership:", error);
      }
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'activa': return 'text-green-500 bg-green-100';
      case 'vencida': return 'text-red-500 bg-red-100';
      case 'próxima a vencer': return 'text-yellow-500 bg-yellow-100';
      case 'congelada': return 'text-blue-500 bg-blue-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold text-white mb-8">Detalles de Mi Membresía</h1>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className={`p-6 ${getStatusColor(membershipData.status).split(' ')[1].replace('bg-', 'border-b-4 border-')}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-700">{membershipData.planName}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(membershipData.status)}`}>
              {membershipData.status}
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-orange-600 mb-2 flex items-center">
              <CalendarDaysIcon className="h-6 w-6 mr-2" /> Periodo de Vigencia
            </h3>
            <p><strong>Inicio:</strong> {formatDate(membershipData.startDate)}</p>
            <p><strong>Fin / Próxima Renovación:</strong> {formatDate(membershipData.endDate)}</p>
            <p className="mt-1">
              <strong>Renovación Automática:</strong>
              <span className={membershipData.autoRenew ? 'text-green-600' : 'text-red-600'}>
                {membershipData.autoRenew ? ' Activada' : ' Desactivada'}
              </span>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-orange-600 mb-2 flex items-center">
              <CreditCardIcon className="h-6 w-6 mr-2" /> Información de Pago
            </h3>
            <p><strong>Método de Pago:</strong> {membershipData.paymentMethod}</p>
            {/* Podría haber un botón para actualizar método de pago */}
          </div>

          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-orange-600 mb-2 flex items-center">
              <InformationCircleIcon className="h-6 w-6 mr-2" /> Beneficios del Plan
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {membershipData.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          {membershipData.status === 'Vencida' && (
            <button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              Renovar Ahora
            </button>
          )}
          {membershipData.status === 'Activa' && membershipData.autoRenew && (
             <button className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors">
              Cancelar Renovación Automática
            </button>
          )}
           {membershipData.status === 'Activa' && !membershipData.autoRenew && (
             <button className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              Activar Renovación Automática
            </button>
          )}
          <button className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Ver Historial de Pagos
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMembership;
