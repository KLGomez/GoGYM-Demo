import React, { useState, useEffect } from 'react';
import { CalendarDaysIcon, ClockIcon, UserGroupIcon, MapPinIcon, NoSymbolIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

// Datos simulados de clases en las que el usuario está inscrito
const simulatedUserEnrollments = [
  { id: 1, classId: 1, name: 'Yoga Matutino', instructor: 'Ana Pérez', day: 'Lunes', time: '08:00 AM', date: '2024-07-29', location: 'Sala Zen', status: 'Confirmada' },
  { id: 2, classId: 4, name: 'Zumba Fiesta', instructor: 'Sofía Luna', day: 'Jueves', time: '07:00 PM', date: '2024-08-01', location: 'Estudio Principal', status: 'Confirmada' },
  { id: 3, classId: 7, name: 'Funcional Avanzado', instructor: 'Carlos Ruiz', day: 'Miércoles', time: '07:00 AM', date: '2024-08-07', location: 'Área Crossfit', status: 'Confirmada' },
  // Ejemplo de una clase pasada para posible feedback
  { id: 4, classId: 2, name: 'HIIT Intenso', instructor: 'Carlos Ruiz', day: 'Martes', time: '06:00 PM', date: '2024-07-23', location: 'Sala Energía', status: 'Asistida' },
];

// Simulación de datos de clases disponibles (para obtener detalles si es necesario, aunque aquí los datos están denormalizados)
const allSimulatedClasses = [
    { id: 1, name: 'Yoga Matutino', instructor: 'Ana Pérez', day: 'Lunes', time: '08:00 AM', duration: '60 min', capacity: 20, enrolled: 15, description: 'Empieza el día con energía y flexibilidad.', location: 'Sala Zen' },
    { id: 2, name: 'HIIT Intenso', instructor: 'Carlos Ruiz', day: 'Martes', time: '06:00 PM', duration: '45 min', capacity: 15, enrolled: 15, description: 'Entrenamiento de alta intensidad para quemar calorías.', location: 'Sala Energía' },
    { id: 3, name: 'Pilates Restaurativo', instructor: 'Laura Gómez', day: 'Miércoles', time: '09:00 AM', duration: '75 min', capacity: 18, enrolled: 10, description: 'Fortalece tu core y mejora tu postura.', location: 'Estudio CuerpoMente' },
    { id: 4, name: 'Zumba Fiesta', instructor: 'Sofía Luna', day: 'Jueves', time: '07:00 PM', duration: '60 min', capacity: 25, enrolled: 22, description: 'Baila, diviértete y ponte en forma.', location: 'Estudio Principal' },
    { id: 5, name: 'Boxeo Fitness', instructor: 'Roberto Díaz', day: 'Viernes', time: '05:30 PM', duration: '60 min', capacity: 12, enrolled: 8, description: 'Libera estrés y tonifica tus músculos.', location: 'Ring de Boxeo' },
    { id: 6, name: 'Yoga Vespertino', instructor: 'Ana Pérez', day: 'Lunes', time: '06:00 PM', duration: '60 min', capacity: 20, enrolled: 18, description: 'Relájate y estira después de un largo día.', location: 'Sala Zen' },
    { id: 7, name: 'Funcional Avanzado', instructor: 'Carlos Ruiz', day: 'Miércoles', time: '07:00 AM', duration: '50 min', capacity: 15, enrolled: 14, description: 'Desafía tus límites con este entrenamiento funcional.', location: 'Área Crossfit' },
];


const UserMyClasses = () => {
  const [myClasses, setMyClasses] = useState([]);
  const [showPastClasses, setShowPastClasses] = useState(false);

  useEffect(() => {
    // En una aplicación real, estos datos vendrían de una API o de localStorage después de la inscripción.
    // Aquí, simplemente usamos los datos simulados directamente.
    // También podríamos filtrar `allSimulatedClasses` basado en IDs de inscripción guardados en localStorage.
    const enrolledClassesDetails = simulatedUserEnrollments.map(enrollment => {
        const classDetail = allSimulatedClasses.find(c => c.id === enrollment.classId);
        return { ...enrollment, ...classDetail, enrollmentId: enrollment.id }; // Asegurar que el ID de inscripción único se mantenga
    });
    setMyClasses(enrolledClassesDetails);
  }, []);

  const handleCancelEnrollment = (enrollmentId, className) => {
    // Lógica para cancelar la inscripción
    alert(`Has cancelado (simulado) tu inscripción a: ${className}.\nEn una aplicación real, esto actualizaría la base de datos y liberaría un cupo.`);
    setMyClasses(prevClasses => prevClasses.filter(c => c.enrollmentId !== enrollmentId));
  };

  const handleLeaveFeedback = (classId, className) => {
    // Lógica para redirigir a la página de feedback o abrir un modal
    alert(`Dejar feedback (simulado) para la clase: ${className}.\nEsto te llevaría a la página de feedback.`);
    // navigate(`/feedback/${classId}`); // Ejemplo de navegación
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const upcomingClasses = myClasses.filter(c => new Date(c.date) >= new Date().setHours(0,0,0,0) && c.status === 'Confirmada').sort((a,b) => new Date(a.date) - new Date(b.date));
  const pastClasses = myClasses.filter(c => new Date(c.date) < new Date().setHours(0,0,0,0) || c.status !== 'Confirmada').sort((a,b) => new Date(b.date) - new Date(a.date));


  const ClassCard = ({ clase }) => (
    <div className="bg-white shadow-lg rounded-lg p-5 flex flex-col justify-between hover:shadow-xl transition-shadow">
      <div>
        <h3 className="text-xl font-bold text-orange-600 mb-2">{clase.name}</h3>
        <p className="text-sm text-gray-600 mb-1 flex items-center"><UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />Instructor: {clase.instructor}</p>
        <p className="text-sm text-gray-600 mb-1 flex items-center"><CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />Fecha: {formatDate(clase.date)}</p>
        <p className="text-sm text-gray-600 mb-1 flex items-center"><ClockIcon className="h-4 w-4 mr-2 text-gray-400" />Hora: {clase.time}</p>
        <p className="text-sm text-gray-600 mb-3 flex items-center"><MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />Lugar: {clase.location}</p>
        {clase.description && <p className="text-xs text-gray-500 mt-1 mb-3">{clase.description}</p>}
      </div>
      <div className="mt-auto pt-3 border-t border-gray-200">
        {new Date(clase.date) >= new Date().setHours(0,0,0,0) && clase.status === 'Confirmada' ? (
          <button
            onClick={() => handleCancelEnrollment(clase.enrollmentId, clase.name)}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center text-sm"
          >
            <NoSymbolIcon className="h-5 w-5 mr-2" />
            Cancelar Inscripción
          </button>
        ) : (
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-500 mb-2">Estado: {clase.status || 'Completada'}</p>
            {clase.status === 'Asistida' && ( // O alguna otra lógica para determinar si se puede dar feedback
                 <button
                    onClick={() => handleLeaveFeedback(clase.classId, clase.name)}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center text-sm"
                >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    Dejar Feedback
                </button>
            )}
          </div>
        )}
      </div>
    </div>
  );


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Mis Clases Inscritas</h1>

      <h2 className="text-2xl font-semibold text-orange-500 mb-4">Próximas Clases</h2>
      {upcomingClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {upcomingClasses.map((clase) => <ClassCard key={clase.enrollmentId} clase={clase} />)}
        </div>
      ) : (
        <p className="text-gray-500 mb-8">No tienes clases programadas próximamente.</p>
      )}

      <div className="mb-6">
        <button
          onClick={() => setShowPastClasses(!showPastClasses)}
          className="text-orange-600 hover:text-orange-700 font-semibold"
        >
          {showPastClasses ? 'Ocultar Clases Pasadas' : 'Mostrar Clases Pasadas'}
        </button>
      </div>

      {showPastClasses && (
        <>
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">Clases Pasadas</h2>
          {pastClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastClasses.map((clase) => <ClassCard key={clase.enrollmentId} clase={clase} />)}
            </div>
          ) : (
            <p className="text-gray-500">No tienes clases en tu historial.</p>
          )}
        </>
      )}
       {myClasses.length === 0 && !showPastClasses && upcomingClasses.length === 0 && (
         <p className="text-center text-gray-500 text-xl py-10">Aún no te has inscrito a ninguna clase. ¡Explora las clases disponibles!</p>
       )}
    </div>
  );
};

export default UserMyClasses;
