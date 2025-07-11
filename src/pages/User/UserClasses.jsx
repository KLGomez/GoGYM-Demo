import React, { useState, useEffect, useContext } from 'react'; // Importar useContext
import { CalendarIcon, UserGroupIcon, ClockIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { showSuccess, showError, confirmAction } from '../../utils/alerts';
import { SharedDataContext } from '../../contexts/SharedDataContext'; // Importar el contexto

// Los datos simulados ya no son necesarios aquí, vendrán del contexto.
// const simulatedClasses = [ ... ];

const UserClasses = () => {
  const { gymClasses, currentUser, enrollToClass, isLoading } = useContext(SharedDataContext); // Usar el contexto

  // El estado local 'classes' ahora se inicializa desde gymClasses del contexto.
  const [classesToDisplay, setClassesToDisplay] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [filterInstructor, setFilterInstructor] = useState('');

  useEffect(() => {
    if (!isLoading && gymClasses) {
      setClassesToDisplay(gymClasses); // Cargar clases del contexto cuando estén listas
    }
  }, [gymClasses, isLoading]);


  const handleEnroll = (classId) => {
    if (!currentUser) {
      showError("Acción Requerida", "Debes iniciar sesión para inscribirte a una clase.");
      // Podríamos redirigir al login: navigate('/login');
      return;
    }

    const selectedClass = gymClasses.find(c => c.id === classId);
    if (!selectedClass) {
      showError("Error", "Clase no encontrada.");
      return;
    }

    // La verificación de membresía activa y cupos ahora se hace DENTRO de enrollToClass en el contexto.
    // enrollToClass(userId, classId) ya maneja estas validaciones y muestra SweetAlerts.
    confirmAction(
      `Confirmar Inscripción`,
      `¿Deseas inscribirte a la clase "${selectedClass.name}" (${selectedClass.day} - ${selectedClass.time})?`,
      "Sí, inscribirme",
      () => {
        const success = enrollToClass(currentUser.id, classId);
        if (success) {
          // La notificación de éxito ya la da enrollToClass.
          // El estado de gymClasses en el contexto se actualizará, y este componente
          // se re-renderizará debido al useEffect que depende de gymClasses.
          // No es necesario actualizar localmente setClassesToDisplay aquí si gymClasses se actualiza correctamente.
          console.log(`Intento de inscripción a: ${selectedClass.name} por usuario ${currentUser.id}. Resultado: ${success}`);
        }
        // Si enrollToClass devuelve false, ya habrá mostrado un SweetAlert de error.
      }
    );
  };

  // Generar listas para filtros a partir de las clases mostradas (classesToDisplay)
  const uniqueDays = [...new Set(classesToDisplay.map(c => c.day))].sort();
  const uniqueInstructors = [...new Set(classesToDisplay.map(c => c.instructor))].sort();

  const filteredClasses = classesToDisplay.filter(c => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterDay === '' || c.day === filterDay) &&
      (filterInstructor === '' || c.instructor === filterInstructor)
    );
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold text-white mb-6">Clases Disponibles</h1>

      {/* Filtros */}
      <div className="mb-8 p-4 bg-white shadow rounded-lg">
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
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
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
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
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
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              value={filterInstructor}
              onChange={(e) => setFilterInstructor(e.target.value)}
            >
              <option value="">Todos los instructores</option>
              {uniqueInstructors.map(instructor => <option key={instructor} value={instructor}>{instructor}</option>)}
            </select>
          </div>
          <button
            onClick={() => { setSearchTerm(''); setFilterDay(''); setFilterInstructor(''); }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md flex items-center justify-center"
            title="Limpiar filtros"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" /> Limpiar
          </button>
        </div>
      </div>

      {/* Listado de Clases */}
      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((clase) => (
            <div key={clase.id} className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between hover:shadow-xl transition-shadow">
              <div>
                <h2 className="text-xl font-bold text-orange-600 mb-2">{clase.name}</h2>
                <p className="text-sm text-gray-600 mb-1 flex items-center"><UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />Instructor: {clase.instructor}</p>
                <p className="text-sm text-gray-600 mb-1 flex items-center"><CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />Día: {clase.day}</p>
                <p className="text-sm text-gray-600 mb-1 flex items-center"><ClockIcon className="h-4 w-4 mr-2 text-gray-400" />Hora: {clase.time} ({clase.duration})</p>
                <p className="text-xs text-gray-500 mt-2 mb-3">{clase.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-3">
                  Cupos: {clase.enrolled} / {clase.capacity}
                  <span className={`ml-2 font-semibold ${clase.enrolled >= clase.capacity ? 'text-red-500' : 'text-green-500'}`}>
                    {clase.enrolled >= clase.capacity ? '(Llena)' : `(${clase.capacity - clase.enrolled} disponibles)`}
                  </span>
                </p>
                <button
                  onClick={() => handleEnroll(clase.id)}
                  disabled={clase.enrolled >= clase.capacity}
                  className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors ${
                    clase.enrolled >= clase.capacity
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {clase.enrolled >= clase.capacity ? 'Clase Llena' : 'Inscribirme'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-xl py-10">No hay clases que coincidan con tus filtros.</p>
      )}
    </div>
  );
};

export default UserClasses;
