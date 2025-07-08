import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeftIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { showSuccess, showError } from '../utils/alerts';
import { getGymClasses, getClients, getClassEnrollments, saveClassEnrollments } from '../utils/storage';
import { calculateMembershipDetails } from '../utils/membershipUtils'; // Importar para verificar estado de membresía


const EnrollStudentsView = ({ onBack }) => {
  const [allClasses, setAllClasses] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState('');

  useEffect(() => {
    setAllClasses(getGymClasses());
    setAllClients(getClients());
    setEnrollments(getClassEnrollments());
  }, []);

  useEffect(() => {
    saveClassEnrollments(enrollments);
  }, [enrollments]);

  const selectedClassDetails = useMemo(() =>
    allClasses.find(c => c.id === selectedClassId),
    [allClasses, selectedClassId]
  );

  const enrolledClientIdsInSelectedClass = useMemo(() =>
    enrollments
      .filter(e => e.classId === selectedClassId)
      .map(e => e.clientId),
    [enrollments, selectedClassId]
  );

  // Procesar clientes con su estado de membresía
  const clientsWithMembershipStatus = useMemo(() =>
    allClients.map(client => ({
      ...client,
      membership: calculateMembershipDetails(client.membershipStartDate, client.membershipDurationDays)
    })),
    [allClients]
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


  const handleEnrollStudent = (clientId) => {
    if (!selectedClassId || !selectedClassDetails) {
      showError("Error", "Por favor, seleccione una clase primero.");
      return;
    }

    const clientToEnroll = clientsWithMembershipStatus.find(c => c.id === clientId);
    if (clientToEnroll?.membership.status !== "Active") {
        showError("Membresía No Activa", `El alumno ${clientToEnroll?.name || ''} no tiene una membresía activa.`);
        return;
    }

    if (enrolledClientIdsInSelectedClass.length >= selectedClassDetails.capacity) {
        showError("Clase Llena", `La clase "${selectedClassDetails.name}" ya ha alcanzado su capacidad máxima de ${selectedClassDetails.capacity} alumnos.`);
        return;
    }

    const newEnrollment = {
      id: `enroll_${clientId}_${selectedClassId}`,
      clientId,
      classId: selectedClassId,
      enrollmentDate: new Date().toISOString()
    };
    setEnrollments(prev => [...prev, newEnrollment]);
    showSuccess("Alumno Inscrito", `${clientToEnroll?.name || 'El alumno'} ha sido inscrito en ${selectedClassDetails?.name || 'la clase'}.`);
  };

  const handleUnenrollStudent = (clientId) => {
    if (!selectedClassId) return;

    setEnrollments(prev => prev.filter(e => !(e.clientId === clientId && e.classId === selectedClassId)));
    const client = allClients.find(c => c.id === clientId); // Para el mensaje
    showSuccess("Alumno Desinscrito", `${client?.name || 'El alumno'} ha sido desinscrito de ${selectedClassDetails?.name || 'la clase'}.`);
  };


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
          {allClasses.map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.name} ({cls.dayOfWeek}, {cls.startTime}-{cls.endTime} - Prof: {cls.instructor}) {/* Asume que cls.instructor es el nombre */}
            </option>
          ))}
        </select>
      </div>

      {selectedClassDetails && (
        <div className="mb-4 text-sm text-gray-300">
            Capacidad: {enrolledClientIdsInSelectedClass.length} / {selectedClassDetails.capacity}
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
                  <li key={client.id} className={`flex justify-between items-center p-2 rounded ${client.membership.status === "Active" ? 'bg-gray-700' : 'bg-red-900 opacity-70'}`}>
                    <div>
                      <span className={`text-gray-100 ${client.membership.status !== "Active" ? 'line-through' : ''}`}>{client.name}</span>
                      <span className={`text-xs ml-2 ${client.membership.status === "Active" ? 'text-green-400' : 'text-red-300'}`}>
                        ({client.membership.status})
                      </span>
                      <span className="text-xs text-gray-400 block sm:inline sm:ml-2">({client.email})</span>
                    </div>
                    <button
                      onClick={() => handleEnrollStudent(client.id)}
                      disabled={enrolledClientIdsInSelectedClass.length >= selectedClassDetails.capacity || client.membership.status !== "Active"}
                      className="p-1 text-green-400 hover:text-green-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                      title={client.membership.status !== "Active" ? `Membresía ${client.membership.status}` : (enrolledClientIdsInSelectedClass.length >= selectedClassDetails.capacity ? "Clase llena" : "Inscribir Alumno")}
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
                      <span className="text-gray-100">{client.name}</span>
                      <span className={`text-xs ml-2 ${client.membership.status === "Active" ? 'text-green-400' : 'text-red-300'}`}>
                        ({client.membership.status}) {/* Mostrar estado aquí también por consistencia */}
                      </span>
                       <span className="text-xs text-gray-400 block sm:inline sm:ml-2">({client.email})</span>
                    </div>
                    <button
                      onClick={() => handleUnenrollStudent(client.id)}
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
