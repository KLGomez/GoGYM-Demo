import React, { useContext } from 'react';
import { CreditCardIcon, TagIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { SharedDataContext } from '../../contexts/SharedDataContext';
import CardMenuOption from '../../components/CardMenuOption';
import { showSuccess } from '../../utils/alerts';

const UserMembership = () => {
  const { membershipPlans, isLoading } = useContext(SharedDataContext);

  if (isLoading) {
    return <p className="text-center text-white text-xl py-10 bg-gray-800 min-h-screen">Cargando planes de membresía...</p>;
  }

  const handlePlanClick = (plan) => {
    showSuccess("Información del Plan", `Has seleccionado el plan: ${plan.nombre}. Precio: $${plan.precio}. Duración: ${plan.duracionEnDias} días.`);
    // Aquí se podría redirigir a una página de compra o mostrar un modal con más detalles
  };

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen rounded-xl">
      <h1 className="text-3xl font-bold text-orange-400 mb-8">Nuestros Planes de Membresía</h1>

      {membershipPlans.length === 0 && !isLoading ? (
        <p className="text-gray-400 text-center py-8">No hay planes de membresía disponibles en este momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {membershipPlans.map((plan) => (
            <CardMenuOption
              key={plan.id}
              icon={<CreditCardIcon className="w-10 h-10 text-orange-400" />}
              label={plan.nombre}
              description={
                <>
                  <p>Precio: ${parseFloat(plan.precio).toFixed(2)}</p>
                  <p>Duración: {plan.duracionEnDias} días</p>
                  {plan.descripcion && <p className="text-sm text-gray-400 mt-2">{plan.descripcion}</p>}
                </>
              }
              onClick={() => handlePlanClick(plan)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserMembership;