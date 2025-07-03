import React, { useState, useEffect } from 'react';
import { CalendarIcon, UserGroupIcon, ClockIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

// Datos simulados de clases
const simulatedClasses = [
  { id: 1, name: 'Yoga Matutino', instructor: 'Ana Pérez', day: 'Lunes', time: '08:00 AM', duration: '60 min', capacity: 20, enrolled: 15, description: 'Empieza el día con energía y flexibilidad.' },
  { id: 2, name: 'HIIT Intenso', instructor: 'Carlos Ruiz', day: 'Martes', time: '06:00 PM', duration: '45 min', capacity: 15, enrolled: 15, description: 'Entrenamiento de alta intensidad para quemar calorías.' },
  { id: 3, name: 'Pilates Restaurativo', instructor: 'Laura Gómez', day: 'Miércoles', time: '09:00 AM', duration: '75 min', capacity: 18, enrolled: 10, description: 'Fortalece tu core y mejora tu postura.' },
  { id: 4, name: 'Zumba Fiesta', instructor: 'Sofía Luna', day: 'Jueves', time: '07:00 PM', duration: '60 min', capacity: 25, enrolled: 22, description: 'Baila, diviértete y ponte en forma.' },
  { id: 5, name: 'Boxeo Fitness', instructor: 'Roberto Díaz', day: 'Viernes', time: '05:30 PM', duration: '60 min', capacity: 12, enrolled: 8, description: 'Libera estrés y tonifica tus músculos.' },
  { id: 6, name: 'Yoga Vespertino', instructor: 'Ana Pérez', day: 'Lunes', time: '06:00 PM', duration: '60 min', capacity: 20, enrolled: 18, description: 'Relájate y estira después de un largo día.' },
  { id: 7, name: 'Funcional Avanzado', instructor: 'Carlos Ruiz', day: 'Miércoles', time: '07:00 AM', duration: '50 min', capacity: 15, enrolled: 14, description: 'Desafía tus límites con este entrenamiento funcional.' },
];

const UserClasses = () => {
  const [classes, setClasses] = useState(simulatedClasses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [filterInstructor, setFilterInstructor] = useState('');

  // Simular la obtención de clases desde una API en el futuro
  // useEffect(() => {
  //   // fetch('/api/classes').then(res => res.json()).then(data => setClasses(data));
  // }, []);

  const handleEnroll = (classId) => {
    // Lógica para inscribirse a una clase
    // Por ahora, solo un console.log y una alerta
    // En una app real: verificar membresía activa, cupo, etc.
    const selectedClass = classes.find(c => c.id === classId);
    console.log(`Inscribiendo a la clase: ${selectedClass.name}`);
    alert(`Te has inscrito (simulado) a: ${selectedClass.name}.\nEn una aplicación real, esto verificaría tu membresía y el cupo.`);
    // Aquí se podría actualizar el estado de 'enrolled' o recargar datos.
  };

  const uniqueDays = [...new Set(simulatedClasses.map(c => c.day))];
  const uniqueInstructors = [...new Set(simulatedClasses.map(c => c.instructor))];

  const filteredClasses = classes.filter(c => {
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
