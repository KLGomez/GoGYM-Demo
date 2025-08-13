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

  // LOG: Verificar datos recibidos del contexto
  console.log('contextGymClasses:', contextGymClasses);
  console.log('contextTeachers:', contextTeachers);
  console.log('isLoading:', isLoading);

  // scheduledClasses ahora se calcula con useMemo a partir del contexto
  const scheduledClasses = useMemo(() => {
    if (isLoading || !contextGymClasses) return {};

    // LOG: Verificar datos antes de agrupar
    console.log('Datos de clases antes de agrupar:', contextGymClasses);

    const groupedClasses = (contextGymClasses || []).reduce((acc, cls) => {
      // Soportar tanto 'dia' como 'day' para compatibilidad
      const day = cls.dia || cls.day;
      if (!day) {
        console.warn('Clase sin día:', cls);
        return acc;
      }
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(cls);
      return acc;
    }, {});

    // LOG: Verificar agrupamiento por día
    console.log('Clases agrupadas por día:', groupedClasses);

    for (const day in groupedClasses) {
      groupedClasses[day].sort((a, b) => {
        // Usar 'horaInicio', 'startTime', o 'time'
        const timeA = a.horaInicio || a.startTime || a.time || "00:00";
        const timeB = b.horaInicio || b.startTime || b.time || "00:00";
        return timeA.localeCompare(timeB);
      });
    }
    return groupedClasses;
  }, [contextGymClasses, isLoading]);

  const getTeacherName = (profesorId) => {
    if (isLoading || !contextTeachers) return 'Cargando...';
    // LOG: Verificar array de profesores y el id buscado
    console.log('Buscando profesorId:', profesorId, 'en contextTeachers:', contextTeachers);
    // Buscar por id, _id, instructorId, etc.
    const teacher = contextTeachers.find(t =>
      t.id === profesorId ||
      t._id === profesorId ||
      t.instructorId === profesorId ||
      t.profesor === profesorId
    );
    if (!teacher) {
      console.warn('No se encontró profesor para id:', profesorId);
      return 'N/A';
    }
    // Soportar ambos modelos
    return teacher.nombre ? `${teacher.nombre} ${teacher.apellido}` : (teacher.name || 'N/A');
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {daysOrder.map(day => (
            <div key={day} className="bg-gray-800 p-4 rounded-lg shadow-lg min-h-[200px]">
              <h3 className="text-xl font-semibold text-orange-500 mb-3 border-b border-gray-700 pb-2 capitalize">{day}</h3>
              {scheduledClasses[day] && scheduledClasses[day].length > 0 ? (
                <ul className="space-y-3">
                  {scheduledClasses[day].map((cls, idx) => {
                    console.log('[ScheduleView] Renderizando clase:', {
                      nombre: cls.nombre || cls.name,
                      dia: cls.dia || cls.day,
                      id: cls.id,
                      horaInicio: cls.horaInicio,
                      horaFin: cls.horaFin
                    });
                    return (
                      <li key={cls.id ? `${cls.id}` : `${day}-${idx}`} className="bg-gray-700 p-3 rounded shadow hover:shadow-md transition-shadow">
                        <p className="font-semibold text-white text-md">{cls.nombre || cls.name}</p>
                        <p className="text-sm text-orange-300">
                          {(cls.horaInicio || cls.startTime || cls.time) || ''}{(cls.horaFin || cls.endTime) ? ` - ${(cls.horaFin || cls.endTime)}` : (cls.duration ? ` (${cls.duration})` : '')}
                        </p>
                        {/* Si cls.profesor es objeto, usar su id; si es string, usar directamente */}
                        <p className="text-sm text-gray-300">
                          Prof: {getTeacherName(
                            typeof cls.profesor === 'object' && cls.profesor !== null
                              ? cls.profesor._id || cls.profesor.id || ''
                              : (cls.profesor || cls.instructorId)
                          )}
                        </p>
                        {cls.capacidad || cls.capacity ? (
                          <p className="text-xs text-gray-400">Cupos: {cls.enrolled || 0}/{cls.capacidad || cls.capacity}</p>
                        ) : null}
                      </li>
                    );
                  })}
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
/*  */