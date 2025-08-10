import React, { useState, useEffect, useContext } from 'react'; // Importar useContext
import { CalendarDaysIcon, ClockIcon, UserGroupIcon, MapPinIcon, NoSymbolIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { confirmAction } from '../../utils/alerts';
import { SharedDataContext } from '../../contexts/SharedDataContext'; // Importar el contexto
import { useNavigate } from 'react-router-dom'; // Para navegar a la página de feedback

// Los datos simulados ya no son necesarios aquí, vendrán del contexto.
// const simulatedUserEnrollments = [ ... ];
// const allSimulatedClasses = [ ... ];

const UserMyClasses = () => {
  const { currentUser, enrollments, gymClasses, teachers, cancelEnrollment, isLoading } = useContext(SharedDataContext);
  const navigate = useNavigate();

  const [myClassesDetails, setMyClassesDetails] = useState([]);
  const [showPastClasses, setShowPastClasses] = useState(false);

  useEffect(() => {
    if (!isLoading && currentUser && enrollments && gymClasses) {
      const userEnrollments = enrollments.filter(enr => enr.userId === currentUser.id);
      const detailedClasses = userEnrollments.map(enrollment => {
        const classDetail = gymClasses.find(c => c.id === enrollment.classId);
        if (!classDetail) return null;
        // Buscar nombre del profesor
        let profName = 'N/A';
        if (classDetail.profesor && Array.isArray(teachers)) {
          const prof = teachers.find(t => t.id === classDetail.profesor);
          if (prof) profName = `${prof.nombre} ${prof.apellido}`;
        }
        return {
          ...classDetail,
          enrollmentId: enrollment.id,
          enrollmentDate: enrollment.enrollmentDate,
          date: classDetail?.date || new Date(enrollment.enrollmentDate).toISOString().split('T')[0],
          profName
        };
      }).filter(Boolean);
      setMyClassesDetails(detailedClasses);
    }
  }, [currentUser, enrollments, gymClasses, teachers, isLoading]);


  const handleCancelEnrollment = (enrollmentId, className) => {
    confirmAction(
      `Cancelar Inscripción`,
      `¿Estás seguro de que deseas cancelar tu inscripción a la clase "${className}"?`,
      "Sí, cancelar",
      () => {
        const success = cancelEnrollment(enrollmentId);
        if (success) {
          // La notificación de éxito ya la da cancelEnrollment.
          // El estado de enrollments y gymClasses en el contexto se actualizará,
          // y este componente se re-renderizará.
          console.log(`Intento de cancelación de inscripción ID: ${enrollmentId}. Resultado: ${success}`);
        }
        // Si cancelEnrollment devuelve false, ya habrá mostrado un SweetAlert de error.
      }
    );
  };

  const handleLeaveFeedback = (classId, className) => {
    confirmAction(
      "Dejar Feedback",
      `¿Deseas dejar un feedback para la clase "${className}"?`,
      "Sí, continuar",
      () => {
        // showSuccess("Redirigiendo", `Serás redirigido para dejar tu feedback sobre "${className}".`);
        navigate(`/user/feedback?classId=${classId}&className=${encodeURIComponent(className)}`);
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    // Asegurarse de que la fecha se interprete correctamente, especialmente si solo es YYYY-MM-DD
    const date = new Date(dateString + 'T00:00:00'); // Asumir medianoche local si no hay hora
    return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Adaptar la lógica de 'status' y filtrado de clases pasadas/futuras.
  // Asumimos que 'clase.date' es la fecha de la clase específica.
  // 'clase.status' vendría del admin o se inferiría. Por ahora, lo simulamos.
  const upcomingClasses = myClassesDetails.filter(c => new Date(c.date) >= new Date().setHours(0,0,0,0) /* && c.status !== 'Cancelada' */).sort((a,b) => new Date(a.date) - new Date(b.date));
  const pastClasses = myClassesDetails.filter(c => new Date(c.date) < new Date().setHours(0,0,0,0) /* || c.status === 'Cancelada' */).sort((a,b) => new Date(b.date) - new Date(a.date));


  const ClassCard = ({ clase }) => {
    const isUpcoming = new Date(clase.date) >= new Date().setHours(0,0,0,0);
    const simulatedStatus = clase.status || (isUpcoming ? 'Confirmada' : 'Completada');
    return (
      <div className="bg-gray-800 shadow-lg rounded-xl p-5 flex flex-col justify-between hover:bg-gray-700 transition-all border border-gray-700">
        <div>
          <h3 className="text-xl font-bold text-orange-400 mb-2">{clase.nombre || clase.name || 'Nombre de Clase no Disponible'}</h3>
          <p className="text-sm text-gray-400 mb-1 flex items-center"><UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />Profesor: {clase.profName || 'N/A'}</p>
          <p className="text-sm text-gray-400 mb-1 flex items-center"><CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />Fecha: {formatDate(clase.date)}</p>
          <p className="text-sm text-gray-400 mb-1 flex items-center"><ClockIcon className="h-4 w-4 mr-2 text-gray-400" />Hora: {clase.horaInicio || clase.time || 'N/A'}{clase.horaFin ? ` - ${clase.horaFin}` : ''}</p>
          {clase.description && <p className="text-xs text-gray-500 mt-1 mb-3">{clase.description}</p>}
        </div>
        <div className="mt-auto pt-3 border-t border-gray-700">
          {isUpcoming && simulatedStatus === 'Confirmada' ? (
            <button
              onClick={() => handleCancelEnrollment(clase.enrollmentId, clase.nombre || clase.name)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center text-sm"
            >
              <NoSymbolIcon className="h-5 w-5 mr-2" />
              Cancelar Inscripción
            </button>
          ) : (
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-400 mb-2">Estado: {simulatedStatus}</p>
              {(simulatedStatus === 'Completada' || simulatedStatus === 'Asistida') && (
                   <button
                      onClick={() => handleLeaveFeedback(clase.id, clase.nombre || clase.name)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center text-sm"
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
  }

  if (isLoading) {
    return <p className="text-center text-white text-xl py-10">Cargando tus clases...</p>;
  }
  if (!currentUser) {
    return (
        <div className="text-center py-10">
            <p className="text-white text-xl mb-4">Por favor, inicia sesión para ver tus clases.</p>
            <button onClick={() => navigate('/login')} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg">
                Ir a Login
            </button>
        </div>
    );
  }


  return (
  <div className="container mx-auto p-4 bg-gray-800 min-h-screen rounded-xl">
      <h1 className="text-3xl font-bold text-orange-400 mb-6">Mis Clases Inscritas</h1>

      <h2 className="text-2xl font-semibold text-orange-400 mb-4">Próximas Clases</h2>
      {upcomingClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {upcomingClasses.map((clase) => <ClassCard key={clase.enrollmentId} clase={clase} />)}
        </div>
      ) : (
        <p className="text-gray-400 mb-8">No tienes clases programadas próximamente.</p>
      )}

      <div className="mb-6">
        <button
          onClick={() => setShowPastClasses(!showPastClasses)}
          className="text-orange-400 hover:text-orange-500 font-semibold"
        >
          {showPastClasses ? 'Ocultar Clases Pasadas/Canceladas' : 'Mostrar Clases Pasadas/Canceladas'}
        </button>
      </div>

      {showPastClasses && (
        <>
          <h2 className="text-2xl font-semibold text-orange-400 mb-4">Clases Pasadas o Canceladas</h2>
          {pastClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastClasses.map((clase) => <ClassCard key={clase.enrollmentId} clase={clase} />)}
            </div>
          ) : (
            <p className="text-gray-400">No tienes clases en tu historial.</p>
          )}
        </>
      )}
       {myClassesDetails.length === 0 && (
         <p className="text-center text-gray-400 text-xl py-10">Aún no te has inscrito a ninguna clase. ¡Explora las clases disponibles!</p>
       )}
    </div>
  );
};

export default UserMyClasses;
