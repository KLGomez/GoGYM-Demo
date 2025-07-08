import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getGymClasses } from '../utils/storage'; // Importar desde utils

const daysOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const ScheduleView = ({ onBack }) => {
  const [scheduledClasses, setScheduledClasses] = useState({});

  useEffect(() => {
    const allClasses = getGymClasses(); // Usar getGymClasses
    const groupedClasses = allClasses.reduce((acc, cls) => {
      const day = cls.dayOfWeek;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(cls);
      return acc;
    }, {});

    // Ordenar clases dentro de cada día por startTime
    for (const day in groupedClasses) {
      groupedClasses[day].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });
    }
    setScheduledClasses(groupedClasses);
  }, []);

  const isEmptySchedule = Object.keys(scheduledClasses).length === 0 ||
                          daysOrder.every(day => !scheduledClasses[day] || scheduledClasses[day].length === 0);


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

      {isEmptySchedule ? (
        <p className="text-gray-400 bg-gray-800 p-6 rounded-lg shadow-lg">
          No hay clases programadas para mostrar en el cronograma.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {daysOrder.map(day => (
            <div key={day} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-orange-500 mb-3 border-b border-gray-700 pb-2">{day}</h3>
              {scheduledClasses[day] && scheduledClasses[day].length > 0 ? (
                <ul className="space-y-3">
                  {scheduledClasses[day].map(cls => (
                    <li key={cls.id} className="bg-gray-700 p-3 rounded shadow hover:shadow-md transition-shadow">
                      <p className="font-semibold text-white text-md">{cls.name}</p>
                      <p className="text-sm text-orange-300">{cls.startTime} - {cls.endTime}</p>
                      <p className="text-sm text-gray-300">Prof: {cls.instructor}</p>
                      <p className="text-xs text-gray-400">Capacidad: {cls.capacity}</p>
                      {cls.description && <p className="text-xs text-gray-400 mt-1 italic">"{cls.description}"</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No hay clases programadas para este día.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
