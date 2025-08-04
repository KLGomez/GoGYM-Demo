import React, { useState, useEffect, useContext } from 'react'; // Importar useContext
import { ShieldCheckIcon, CalendarDaysIcon, InformationCircleIcon, CreditCardIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { showSuccess, showError, confirmAction } from '../../utils/alerts';
import { SharedDataContext } from '../../contexts/SharedDataContext'; // Importar el contexto
import { useNavigate } from 'react-router-dom'; // Para el botón de login

// Definición de beneficios por plan (esto podría venir del contexto o API en el futuro)
//por ahora esta en el panel de admin como un crud
const PLAN_BENEFITS = {
  'Plan Básico Mensual': [
    'Acceso a clases grupales (excepto especiales)',
    'Uso de máquinas de cardio y pesas',
    '1 evaluación física al inicio',
  ],
  'Plan Premium Mensual': [
    'Acceso ilimitado a todas las clases',
    'Acceso a clases especiales online',
    'Descuento 10% en tienda de suplementos',
    '1 invitado gratis por mes',
    'Evaluación física mensual',
  ],
  'Plan Gold Anual': [
    'Todos los beneficios del Plan Premium',
    'Acceso prioritario a nuevas clases',
    'Descuento 20% en tienda de suplementos',
    'Toalla y agua gratis en cada visita',
    '2 invitados gratis por mes',
  ],
  'default': [
    'Beneficios no especificados para este plan.',
  ]
};


const UserMembership = () => {
  const { currentUser, updateClientMembership, isLoading } = useContext(SharedDataContext);
  const navigate = useNavigate();

  // El estado local ahora se deriva del currentUser del contexto
  const [membershipData, setMembershipData] = useState({
    planName: 'N/A',
    status: 'Desconocido',
    startDate: null,
    endDate: null,
    renewalDate: null, // Podría ser igual a endDate si no hay auto-renovación
    paymentMethod: 'No especificado', // Esto usualmente no se guarda en el cliente por seguridad
    benefits: [],
    autoRenew: false,
  });

  useEffect(() => {
    if (currentUser && currentUser.membership) {
      const userMembership = currentUser.membership;
      // Calcular detalles de la membresía (status, endDate) si es necesario
      // Aquí asumimos que 'status' y 'endDate' ya vienen calculados o se pueden derivar
      // de `membershipStartDate` y `membershipDurationDays` como en `ClientesAdmin.jsx`

      // Lógica simple para calcular endDate y status (debería ser robusta y centralizada)
      let status = userMembership.status || 'Desconocido';
      let endDate = userMembership.endDate;
      if (userMembership.membershipStartDate && userMembership.membershipDurationDays) {
          const startDate = new Date(userMembership.membershipStartDate);
          endDate = new Date(startDate.setDate(startDate.getDate() + userMembership.membershipDurationDays)).toISOString().split('T')[0];
          const today = new Date().toISOString().split('T')[0];
          if (endDate < today) {
              status = 'Vencida';
          } else if (new Date(endDate).getTime() - new Date(today).getTime() <= 7 * 24 * 60 * 60 * 1000) { // Menos de 7 días
              status = 'Próxima a vencer';
          } else {
              status = 'Activa';
          }
      }


      setMembershipData({
        planName: userMembership.planName || 'Plan no asignado',
        status: status,
        startDate: userMembership.membershipStartDate,
        endDate: endDate,
        renewalDate: userMembership.autoRenew ? endDate : null, // O la lógica que se defina
        paymentMethod: userMembership.paymentMethod || 'No especificado',
        benefits: PLAN_BENEFITS[userMembership.planName] || PLAN_BENEFITS['default'],
        autoRenew: userMembership.autoRenew || false,
      });
    } else if (!isLoading && !currentUser) {
        // Si no hay usuario y no está cargando, podría ser que necesite loguearse
        // o no tiene membresía asignada.
        setMembershipData({ // Reset a estado por defecto o de "no membresía"
            planName: 'Sin Membresía Activa',
            status: 'Inactiva',
            startDate: null, endDate: null, renewalDate: null,
            paymentMethod: 'N/A', benefits: ['Inscríbete a un plan para disfrutar de los beneficios.'], autoRenew: false,
        });
    }
  }, [currentUser, isLoading]);

  const getStatusColor = (status = '') => {
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

  const handleRenewNow = () => {
    // Lógica para renovar la membresía
    // Esto probablemente redirigiría a una página de pago o un modal.
    confirmAction(
      "Renovar Membresía",
      "Serás redirigido para completar el proceso de renovación. ¿Deseas continuar?",
      "Sí, renovar",
      () => {
        showSuccess("Proceso de Renovación", "Iniciando el proceso de renovación...");
        // Aquí iría la lógica de redirección o apertura de modal de pago.
        // Ejemplo: navigate('/checkout?plan=' + membershipData.planName);
        console.log("Usuario quiere renovar membresía:", membershipData.planName);
      }
    );
  };

  const handleToggleAutoRenew = () => {
    const actionText = membershipData.autoRenew ? "desactivar" : "activar";
    const newAutoRenewState = !membershipData.autoRenew;
    confirmAction(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Renovación Automática`,
      `¿Estás seguro de que deseas ${actionText} la renovación automática para tu plan ${membershipData.planName}?`,
      `Sí, ${actionText}`,
      () => {
        if (!currentUser) {
          showError("Error", "Debes iniciar sesión para cambiar esta configuración.");
          return;
        }
        // Lógica para actualizar el estado de auto-renovación
        // Esto llamará a updateClientMembership del contexto, que a su vez actualiza el cliente
        // (que contiene la info de membresía) y por ende localStorage.
        updateClientMembership(currentUser.id, {
            ...currentUser.membership, // Mantener otros datos de membresía
            autoRenew: newAutoRenewState
        });
        // El estado local membershipData se actualizará a través del useEffect que escucha a currentUser.
        // La notificación de éxito ya la da el contexto o la función updateClientMembership.
        console.log("Nuevo estado de auto-renovación solicitado:", newAutoRenewState);
      }
    );
  };

  const handleViewPaymentHistory = () => {
    // Lógica para mostrar el historial de pagos
    // Podría ser un modal o una nueva página
    showError("Función No Disponible", "La visualización del historial de pagos aún no está implementada.");
    console.log("Usuario quiere ver historial de pagos.");
  };

  if (isLoading) {
    return <p className="text-center text-white text-xl py-10">Cargando información de tu membresía...</p>;
  }

  if (!currentUser) {
    return (
        <div className="text-center py-10">
            <p className="text-white text-xl mb-4">Por favor, inicia sesión para ver los detalles de tu membresía.</p>
            <button
                onClick={() => navigate('/login')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
                Ir a Login
            </button>
        </div>
    );
  }

  // Si el usuario está logueado pero no tiene datos de membresía (currentUser.membership es null o undefined)
  if (currentUser && !currentUser.membership) {
    return (
        <div className="text-center py-10">
            <p className="text-white text-xl mb-4">Aún no tienes una membresía asignada.</p>
            <p className="text-gray-400 mb-6">Contacta con administración para activar un plan.</p>
            {/* Podríamos añadir un botón para ver planes si existiera esa página */}
        </div>
    );
  }


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold text-white mb-8">Detalles de Mi Membresía</h1>

      {/* Alerta de membresía próxima a vencer o vencida */}
      {(membershipData.status === 'Próxima a vencer' || membershipData.status === 'Vencida') && (
        <div className={`p-4 mb-6 rounded-md flex items-start ${
            membershipData.status === 'Vencida' ? 'bg-red-100 border-l-4 border-red-500 text-red-700'
                                               : 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700'
            }`}
            role="alert"
        >
          <ExclamationTriangleIcon className="h-6 w-6 mr-3 mt-1" />
          <div>
            <p className="font-bold">
              {membershipData.status === 'Vencida' ? 'Membresía Vencida' : 'Atención: Membresía Próxima a Vencer'}
            </p>
            <p>
              {membershipData.status === 'Vencida'
                ? `Tu membresía ${membershipData.planName} ha vencido el ${formatDate(membershipData.endDate)}.`
                : `Tu membresía ${membershipData.planName} está próxima a vencer el ${formatDate(membershipData.endDate)}.`}
              {' '}
              {membershipData.status === 'Vencida' && (
                <button onClick={handleRenewNow} className="font-semibold underline hover:text-red-800">
                  ¡Renuévala ahora para no perder tus beneficios!
                </button>
              )}
               {membershipData.status === 'Próxima a vencer' && !membershipData.autoRenew && (
                <button onClick={handleRenewNow} className="font-semibold underline hover:text-yellow-800">
                  Considera renovarla pronto.
                </button>
              )}
            </p>
          </div>
        </div>
      )}


      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className={`p-6 ${getStatusColor(membershipData.status).split(' ')[1].replace('bg-', 'border-b-4 border-')}${membershipData.status?.toLowerCase()}`}>
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
            <button
              onClick={handleRenewNow}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Renovar Ahora
            </button>
          )}
          {membershipData.status === 'Activa' && (
             <button
              onClick={handleToggleAutoRenew}
              className={`w-full sm:w-auto font-semibold py-2 px-4 rounded-lg transition-colors ${
                membershipData.autoRenew
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {membershipData.autoRenew ? 'Cancelar Renovación Automática' : 'Activar Renovación Automática'}
            </button>
          )}
          <button
            onClick={handleViewPaymentHistory}
            className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Ver Historial de Pagos
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMembership;
