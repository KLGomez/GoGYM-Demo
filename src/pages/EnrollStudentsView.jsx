import React, { useState, useEffect, useMemo, useContext } from 'react'; // Importar useContext
import { ArrowLeftIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { showSuccess, showError } from '../utils/alerts'; // SweetAlerts ya están en el contexto para acciones principales
import { SharedDataContext } from '../contexts/SharedDataContext'; // Importar el contexto
import { calculateMembershipDetails } from '../utils/membershipUtils';


const EnrollStudentsView = ({ onBack }) => {
  const {
    gymClasses: contextGymClasses,
    clients: contextClients,
    enrollments: contextEnrollments,
    enrollToClass, // Función del contexto para inscribir
    cancelEnrollment, // Función del contexto para desinscribir (por enrollmentId)
    isLoading,
    teachers: contextTeachers // Para mostrar el nombre del profesor
  } = useContext(SharedDataContext);

  const [selectedClassId, setSelectedClassId] = useState('');

  // No se necesitan estados locales para allClasses, allClients, enrollments si se usa el contexto.
  // La persistencia también la maneja el contexto.

  const selectedClassDetails = useMemo(() =>
    (contextGymClasses || []).find(c => c.id === selectedClassId),
    [contextGymClasses, selectedClassId]
  );

  const getInstructorName = (instructorId) => {
    if (!contextTeachers) return '';
    const teacher = contextTeachers.find(t => t.id === instructorId);
    return teacher ? teacher.name : 'Desconocido';
  };

  const enrolledClientIdsInSelectedClass = useMemo(() =>
    (contextEnrollments || [])
      .filter(e => e.classId === selectedClassId)
      .map(e => e.userId), // Cambiado de clientId a userId para coincidir con el modelo del contexto
    [contextEnrollments, selectedClassId]
  );

  const clientsWithMembershipStatus = useMemo(() =>
    (contextClients || []).map(client => {
      // Asegurarse de que client.membership exista y tenga las propiedades necesarias
      const startDate = client.membership?.membershipStartDate;
      const durationDays = client.membership?.membershipDurationDays;
      return {
        ...client,
        // Calcular estado de membresía. Si no hay datos, asumir 'Inactiva' o 'Desconocido'.
        membershipStatusDetails: calculateMembershipDetails(startDate, durationDays)
      };
    }),
    [contextClients]
  );

  const availableStudentsForSelectedClass = useMemo(() =>
    clientsWithMembershipStatus.filter(
      client => !enrolledClientIdsInSelectedClass.includes(client.id)
    ),
    [clientsWithMembershipStatus, enrolledClientIdsInSelectedClass]
  );

  const enrolledStudentsInSelectedClass = useMemo(() =>
    clientsWithMembershipStatus.filter(
      client => enrolledClientIdsInSelectedClass.includes(client.id)
    ),
    [clientsWithMembershipStatus, enrolledClientIdsInSelectedClass]
  );


  const handleEnrollStudentByAdmin = (clientId) => {
    if (!selectedClassId || !selectedClassDetails) {
      showError("Error", "Por favor, seleccione una clase primero."); // Alerta local
      return;
    }
    // La función enrollToClass del contexto ya maneja las validaciones de membresía, cupo y muestra SweetAlerts.
    enrollToClass(clientId, selectedClassId);
  };

  const handleUnenrollStudentByAdmin = (clientId) => {
    if (!selectedClassId) return;
    // Necesitamos el enrollmentId para usar cancelEnrollment del contexto.
    const enrollment = (contextEnrollments || []).find(e => e.userId === clientId && e.classId === selectedClassId);
    if (enrollment) {
      cancelEnrollment(enrollment.id); // cancelEnrollment ya muestra SweetAlerts.
    } else {
      showError("Error", "No se encontró la inscripción para este alumno en esta clase."); // Alerta local
    }
  };

  if (isLoading) {
    return <p className="text-gray-300">Cargando datos...</p>;
  }

  return (
    <div>
      <button onClick={onBack} className="mb-6 text-orange-400 hover:text-orange-500 flex items-center">
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Volver al menú de Clases
      </button>

      <h2 className="text-2xl font-bold text-orange-400 mb-6">Inscribir Alumnos a Clases</h2>

      <div className="mb-6">
        <label htmlFor="classSelect" className="block text-sm font-medium text-gray-200 mb-1">
          Seleccionar Clase:
        </label>
        <select
          id="classSelect"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">-- Elija una clase --</option>
          {(contextGymClasses || []).map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.name} ({cls.day}, {cls.time} - Prof: {getInstructorName(cls.instructorId)})
            </option>
          ))}
        </select>
      </div>

      {selectedClassDetails && (
        <div className="mb-4 text-sm text-gray-300">
            Cupos: {selectedClassDetails.enrolled} / {selectedClassDetails.capacity}
        </div>
      )}

      {selectedClassId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-orange-300 mb-3">Alumnos Disponibles</h3>
            {availableStudentsForSelectedClass.length === 0 ? (
              <p className="text-gray-500">Todos los alumnos ya están inscritos o no hay alumnos con membresía activa disponibles.</p>
            ) : (
              <ul className="space-y-2 max-h-96 overflow-y-auto bg-gray-800 p-3 rounded-md">
                {availableStudentsForSelectedClass.map(client => (
                  <li key={client.id} className={`flex justify-between items-center p-2 rounded ${client.membershipStatusDetails.status === "Active" ? 'bg-gray-700' : 'bg-red-900 opacity-70'}`}>
                    <div>
                      <span className={`text-gray-100 ${client.membershipStatusDetails.status !== "Active" ? 'line-through' : ''}`}>{client.firstName} {client.lastName}</span>
                      <span className={`text-xs ml-2 ${client.membershipStatusDetails.status === "Active" ? 'text-green-400' : 'text-red-300'}`}>
                        ({client.membershipStatusDetails.status})
                      </span>
                      <span className="text-xs text-gray-400 block sm:inline sm:ml-2">({client.email})</span>
                    </div>
                    <button
                      onClick={() => handleEnrollStudentByAdmin(client.id)}
                      // La validación de cupo y membresía la hará enrollToClass, pero podemos deshabilitar visualmente.
                      disabled={selectedClassDetails && selectedClassDetails.enrolled >= selectedClassDetails.capacity || client.membershipStatusDetails.status !== "Active"}
                      className="p-1 text-green-400 hover:text-green-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                      title={client.membershipStatusDetails.status !== "Active" ? `Membresía ${client.membershipStatusDetails.status}` : (selectedClassDetails && selectedClassDetails.enrolled >= selectedClassDetails.capacity ? "Clase llena" : "Inscribir Alumno")}
                    >
                      <UserPlusIcon className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-orange-300 mb-3">Alumnos Inscritos en "{selectedClassDetails?.name}"</h3>
            {enrolledStudentsInSelectedClass.length === 0 ? (
              <p className="text-gray-500">No hay alumnos inscritos en esta clase.</p>
            ) : (
              <ul className="space-y-2 max-h-96 overflow-y-auto bg-gray-800 p-3 rounded-md">
                {enrolledStudentsInSelectedClass.map(client => (
                  <li key={client.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                     <div>
                      <span className="text-gray-100">{client.firstName} {client.lastName}</span>
                      <span className={`text-xs ml-2 ${client.membershipStatusDetails.status === "Active" ? 'text-green-400' : 'text-red-300'}`}>
                        ({client.membershipStatusDetails.status})
                      </span>
                       <span className="text-xs text-gray-400 block sm:inline sm:ml-2">({client.email})</span>
                    </div>
                    <button
                      onClick={() => handleUnenrollStudentByAdmin(client.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                      title="Desinscribir Alumno"
                    >
                      <UserMinusIcon className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollStudentsView;
