import React, { useContext, useMemo } from 'react'; // Importar useContext y useMemo
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { SharedDataContext } from '../contexts/SharedDataContext'; // Importar el contexto

const daysOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const ScheduleView = ({ onBack }) => {
  const {
    gymClasses: contextGymClasses,
    teachers: contextTeachers,
    isLoading
  } = useContext(SharedDataContext);

  // scheduledClasses ahora se calcula con useMemo a partir del contexto
  const scheduledClasses = useMemo(() => {
    if (isLoading || !contextGymClasses) return {};

    const groupedClasses = (contextGymClasses || []).reduce((acc, cls) => {
      const day = cls.day; // El modelo de datos del contexto usa 'day'
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(cls);
      return acc;
    }, {});

    for (const day in groupedClasses) {
      groupedClasses[day].sort((a, b) => {
        // Usar 'time' o 'startTime' si existe
        const timeA = a.time || a.startTime || "00:00";
        const timeB = b.time || b.startTime || "00:00";
        return timeA.localeCompare(timeB);
      });
    }
    return groupedClasses;
  }, [contextGymClasses, isLoading]);

  const getInstructorName = (instructorId) => {
    if (isLoading || !contextTeachers) return 'Cargando...';
    const teacher = contextTeachers.find(t => t.id === instructorId);
    return teacher ? teacher.name : 'N/A';
  };

  const isEmptySchedule = Object.keys(scheduledClasses).length === 0 ||
                          daysOrder.every(day => !scheduledClasses[day] || scheduledClasses[day].length === 0);

  if (isLoading && (!contextGymClasses || !contextTeachers)) {
    return <p className="text-gray-300 text-center py-10">Cargando cronograma...</p>;
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 text-orange-400 hover:text-orange-500 flex items-center"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Volver al menú de Clases
      </button>

      <h2 className="text-2xl font-bold text-orange-400 mb-6">Cronograma Semanal de Clases</h2>

      {isEmptySchedule && !isLoading ? (
        <p className="text-gray-400 bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          No hay clases programadas para mostrar en el cronograma.
        </p>
      ) : (
        // Ajustar el número de columnas para mejor visualización, 7 para días de la semana si es posible
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {daysOrder.map(day => (
            <div key={day} className="bg-gray-800 p-4 rounded-lg shadow-lg min-h-[200px]"> {/* min-h para consistencia */}
              <h3 className="text-xl font-semibold text-orange-500 mb-3 border-b border-gray-700 pb-2 capitalize">{day}</h3>
              {scheduledClasses[day] && scheduledClasses[day].length > 0 ? (
                <ul className="space-y-3">
                  {scheduledClasses[day].map(cls => (
                    <li key={cls.id} className="bg-gray-700 p-3 rounded shadow hover:shadow-md transition-shadow">
                      <p className="font-semibold text-white text-md">{cls.name}</p>
                      <p className="text-sm text-orange-300">
                        {cls.time || cls.startTime}{cls.endTime && cls.startTime ? ` - ${cls.endTime}` : (cls.duration ? ` (${cls.duration})` : '')}
                      </p>
                      <p className="text-sm text-gray-300">Prof: {getInstructorName(cls.instructorId)}</p>
                      <p className="text-xs text-gray-400">Lugar: {cls.location || 'N/A'}</p>
                      <p className="text-xs text-gray-400">Cupos: {cls.enrolled}/{cls.capacity}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic mt-4">No hay clases este día.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
