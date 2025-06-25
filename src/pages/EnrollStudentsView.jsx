import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';

// Placeholder para simular alertas (eventualmente usar las de utils/alerts.js)
const showSuccess = (title, msg) => console.log("SUCCESS:", title, msg);
const showError = (title, msg) => console.error("ERROR:", title, msg);

// Claves de LocalStorage (eventualmente centralizar)
const GYM_CLASSES_STORAGE_KEY = 'gymClasses';
const GYM_CLIENTS_STORAGE_KEY = 'clients';
const CLASS_ENROLLMENTS_STORAGE_KEY = 'classEnrollments';

// Funciones helper para LocalStorage (eventualmente centralizar)
const getFromLocalStorage = (key, defaultValue = []) => {
  const dataJson = localStorage.getItem(key);
  return dataJson ? JSON.parse(dataJson) : defaultValue;
};

const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const EnrollStudentsView = ({ onBack }) => {
  const [allClasses, setAllClasses] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [enrollments, setEnrollments] = useState([]); // { id: 'enroll_clientId_classId', clientId, classId, enrollmentDate }

  const [selectedClassId, setSelectedClassId] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    setAllClasses(getFromLocalStorage(GYM_CLASSES_STORAGE_KEY));
    setAllClients(getFromLocalStorage(GYM_CLIENTS_STORAGE_KEY));
    setEnrollments(getFromLocalStorage(CLASS_ENROLLMENTS_STORAGE_KEY));
  }, []);

  // Guardar inscripciones cuando cambian
  useEffect(() => {
    // Evitar guardar el array vacío inicial si no había nada en LocalStorage
    if (enrollments.length > 0 || localStorage.getItem(CLASS_ENROLLMENTS_STORAGE_KEY)) {
      saveToLocalStorage(CLASS_ENROLLMENTS_STORAGE_KEY, enrollments);
    }
  }, [enrollments]);

  const selectedClassDetails = allClasses.find(c => c.id === selectedClassId);
  const enrolledClientIdsInSelectedClass = enrollments
    .filter(e => e.classId === selectedClassId)
    .map(e => e.clientId);

  const availableStudentsForSelectedClass = allClients.filter(
    client => !enrolledClientIdsInSelectedClass.includes(client.id)
  );
  const enrolledStudentsInSelectedClass = allClients.filter(
    client => enrolledClientIdsInSelectedClass.includes(client.id)
  );


  const handleEnrollStudent = (clientId) => {
    if (!selectedClassId) {
      showError("Error", "Por favor, seleccione una clase primero.");
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
    const client = allClients.find(c => c.id === clientId);
    showSuccess("Alumno Inscrito", `${client?.name || 'El alumno'} ha sido inscrito en ${selectedClassDetails?.name || 'la clase'}.`);
  };

  const handleUnenrollStudent = (clientId) => {
    if (!selectedClassId) return; // Debería ser imposible llegar aquí sin clase seleccionada

    setEnrollments(prev => prev.filter(e => !(e.clientId === clientId && e.classId === selectedClassId)));
    const client = allClients.find(c => c.id === clientId);
    showSuccess("Alumno Desinscrito", `${client?.name || 'El alumno'} ha sido desinscrito de ${selectedClassDetails?.name || 'la clase'}.`);
  };


  return (
    <div>
      <button onClick={onBack} className="mb-6 text-orange-400 hover:text-orange-500 flex items-center">
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Volver al menú de Clases
      </button>

      <h2 className="text-2xl font-bold text-orange-400 mb-6">Inscribir Alumnos a Clases</h2>

      {/* Selector de Clase */}
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
              {cls.name} ({cls.dayOfWeek}, {cls.startTime}-{cls.endTime} - Prof: {cls.instructor})
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
          {/* Alumnos Disponibles para Inscribir */}
          <div>
            <h3 className="text-xl font-semibold text-orange-300 mb-3">Alumnos Disponibles</h3>
            {availableStudentsForSelectedClass.length === 0 ? (
              <p className="text-gray-500">Todos los alumnos ya están inscritos o no hay alumnos disponibles.</p>
            ) : (
              <ul className="space-y-2 max-h-96 overflow-y-auto bg-gray-800 p-3 rounded-md">
                {availableStudentsForSelectedClass.map(client => (
                  <li key={client.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                    <span className="text-gray-100">{client.name} <span className="text-xs text-gray-400">({client.email})</span></span>
                    <button
                      onClick={() => handleEnrollStudent(client.id)}
                      disabled={enrolledClientIdsInSelectedClass.length >= selectedClassDetails.capacity}
                      className="p-1 text-green-400 hover:text-green-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                      title="Inscribir Alumno"
                    >
                      <UserPlusIcon className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Alumnos Ya Inscritos en la Clase */}
          <div>
            <h3 className="text-xl font-semibold text-orange-300 mb-3">Alumnos Inscritos en "{selectedClassDetails?.name}"</h3>
            {enrolledStudentsInSelectedClass.length === 0 ? (
              <p className="text-gray-500">No hay alumnos inscritos en esta clase.</p>
            ) : (
              <ul className="space-y-2 max-h-96 overflow-y-auto bg-gray-800 p-3 rounded-md">
                {enrolledStudentsInSelectedClass.map(client => (
                  <li key={client.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                    <span className="text-gray-100">{client.name} <span className="text-xs text-gray-400">({client.email})</span></span>
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
