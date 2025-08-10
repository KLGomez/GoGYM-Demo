import React, { useState, useEffect, useContext } from 'react'; // Importar useContext
import { CalendarIcon, UserGroupIcon, ClockIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { showError, confirmAction } from '../../utils/alerts';
import { SharedDataContext } from '../../contexts/SharedDataContext'; // Importar el contexto

// Los datos simulados ya no son necesarios aquí, vendrán del contexto.
// const simulatedClasses = [ ... ];

const UserClasses = () => {
  const { gymClasses, teachers, currentUser, enrollToClass, isLoading } = useContext(SharedDataContext); // Usar el contexto

  // El estado local 'classes' ahora se inicializa desde gymClasses del contexto.
  const [classesToDisplay, setClassesToDisplay] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [filterInstructor, setFilterInstructor] = useState('');

  useEffect(() => {
    if (!isLoading && gymClasses) {
      setClassesToDisplay(gymClasses);
    }
  }, [gymClasses, isLoading]);


  const handleEnroll = (classId) => {
    if (!currentUser) {
      showError("Acción Requerida", "Debes iniciar sesión para inscribirte a una clase.");
      return;
    }
    const selectedClass = gymClasses.find(c => c.id === classId);
    if (!selectedClass) {
      showError("Error", "Clase no encontrada.");
      return;
    }
    confirmAction(
      `Confirmar Inscripción`,
      `¿Deseas inscribirte a la clase "${selectedClass.nombre}" (${selectedClass.dia} - ${selectedClass.horaInicio} a ${selectedClass.horaFin})?`,
      "Sí, inscribirme",
      () => {
        const success = enrollToClass(currentUser.id, classId);
        if (success) {
          console.log(`Intento de inscripción a: ${selectedClass.nombre} por usuario ${currentUser.id}. Resultado: ${success}`);
        }
      }
    );
  };

  // Generar listas para filtros a partir de las clases mostradas (classesToDisplay)
  const uniqueDays = [...new Set(classesToDisplay.map(c => c.dia))].sort();
  // Mostrar nombre y apellido del profesor en el filtro
  const uniqueInstructors = [...new Set(classesToDisplay.map(c => {
    const prof = teachers?.find(t => t.id === c.profesor);
    return prof ? `${prof.nombre} ${prof.apellido}` : '';
  }).filter(Boolean))].sort();

  const filteredClasses = classesToDisplay.filter(c => {
    const prof = teachers?.find(t => t.id === c.profesor);
    const profName = prof ? `${prof.nombre} ${prof.apellido}` : '';
    return (
      (c.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterDay === '' || c.dia === filterDay) &&
      (filterInstructor === '' || profName === filterInstructor)
    );
  });

  return (
  <div className="container mx-auto p-4 bg-gray-950 min-h-screen rounded-xl">
      <h1 className="text-3xl font-bold text-orange-400 mb-6">Clases Disponibles</h1>

      {/* Filtros */}
      <div className="mb-8 p-4 bg-gray-800 shadow-lg rounded-xl border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              <MagnifyingGlassIcon className="h-5 w-5 inline-block mr-1 text-gray-400" />
              Buscar Clase
            </label>
            <input
              type="text"
              id="search"
              placeholder="Nombre de la clase..."
              className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="filterDay" className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarIcon className="h-5 w-5 inline-block mr-1 text-gray-400" />
              Filtrar por Día
            </label>
            <select
              id="filterDay"
              className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
            >
              <option value="">Todos los días</option>
              {uniqueDays.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filterInstructor" className="block text-sm font-medium text-gray-700 mb-1">
              <UserGroupIcon className="h-5 w-5 inline-block mr-1 text-gray-400" />
              Filtrar por Instructor
            </label>
            <select
              id="filterInstructor"
              className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              value={filterInstructor}
              onChange={(e) => setFilterInstructor(e.target.value)}
            >
              <option value="">Todos los instructores</option>
              {uniqueInstructors.map(instructor => <option key={instructor} value={instructor}>{instructor}</option>)}
            </select>
          </div>
          <button
            onClick={() => { setSearchTerm(''); setFilterDay(''); setFilterInstructor(''); }}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center"
            title="Limpiar filtros"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" /> Limpiar
          </button>
        </div>
      </div>

      {/* Listado de Clases */}
      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((clase) => {
            const prof = teachers?.find(t => t.id === clase.profesor);
            const profName = prof ? `${prof.nombre} ${prof.apellido}` : 'N/A';
            return (
              <div key={clase.id} className="bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col justify-between hover:bg-gray-700 transition-all border border-gray-700">
                <div>
                  <h2 className="text-xl font-bold text-orange-400 mb-2">{clase.nombre}</h2>
                  <p className="text-sm text-gray-400 mb-1 flex items-center"><UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />Profesor: {profName}</p>
                  <p className="text-sm text-gray-400 mb-1 flex items-center"><CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />Día: {clase.dia}</p>
                  <p className="text-sm text-gray-400 mb-1 flex items-center"><ClockIcon className="h-4 w-4 mr-2 text-gray-400" />Hora: {clase.horaInicio} - {clase.horaFin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300 mb-3">
                    Cupos: {clase.enrolled || 0} / {clase.capacidad}
                    <span className={`ml-2 font-semibold ${(clase.enrolled || 0) >= clase.capacidad ? 'text-red-400' : 'text-green-400'}`}>
                      {(clase.enrolled || 0) >= clase.capacidad ? '(Llena)' : `(${clase.capacidad - (clase.enrolled || 0)} disponibles)`}
                    </span>
                  </p>
                  <button
                    onClick={() => handleEnroll(clase.id)}
                    disabled={(clase.enrolled || 0) >= clase.capacidad}
                    className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors ${
                      (clase.enrolled || 0) >= clase.capacidad
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {(clase.enrolled || 0) >= clase.capacidad ? 'Clase Llena' : 'Inscribirme'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-400 text-xl py-10">No hay clases que coincidan con tus filtros.</p>
      )}
    </div>
  );
};

export default UserClasses;
