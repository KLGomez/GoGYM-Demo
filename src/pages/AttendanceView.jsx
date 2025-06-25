import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
// Asumimos que las alertas ya están creadas y son importables desde utils
// import { showSuccess, showError } from '../utils/alerts';

// Placeholder para simular alertas
const showSuccess = (title, msg) => console.log("SUCCESS:", title, msg);
const showError = (title, msg) => console.error("ERROR:", title, msg);

// Claves de LocalStorage (eventualmente centralizar)
const GYM_CLASSES_STORAGE_KEY = 'gymClasses';
const GYM_CLIENTS_STORAGE_KEY = 'clients'; // Asumiendo que los clientes son los alumnos
const ATTENDANCE_RECORDS_STORAGE_KEY = 'attendanceRecords';

// Funciones helper para LocalStorage (eventualmente centralizar)
const getFromLocalStorage = (key) => {
  const dataJson = localStorage.getItem(key);
  return dataJson ? JSON.parse(dataJson) : [];
};

const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Helper para obtener el día de la semana en español a partir de una fecha (0 Domingo, 1 Lunes, ...)
const getDayOfWeekInSpanish = (dateString) => {
    const date = new Date(dateString + 'T00:00:00'); // Asegurar que se interprete como local
    const dayIndex = date.getDay();
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return days[dayIndex];
};


const AttendanceView = ({ onBack }) => {
  const [allClasses, setAllClasses] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [classesForSelectedDate, setClassesForSelectedDate] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null); // Objeto de la clase seleccionada
  const [studentAttendance, setStudentAttendance] = useState({}); // { clientId: 'Presente'/'Ausente' }

  useEffect(() => {
    setAllClasses(getFromLocalStorage(GYM_CLASSES_STORAGE_KEY));
    setAllClients(getFromLocalStorage(GYM_CLIENTS_STORAGE_KEY));
    setAttendanceRecords(getFromLocalStorage(ATTENDANCE_RECORDS_STORAGE_KEY));
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const dayName = getDayOfWeekInSpanish(selectedDate);
      const filtered = allClasses.filter(cls => cls.dayOfWeek === dayName);
      // TODO: Ordenar por hora de inicio si es necesario
      setClassesForSelectedDate(filtered);
      setSelectedClass(null); // Resetear clase seleccionada al cambiar fecha
      setStudentAttendance({}); // Resetear estado de asistencia
    }
  }, [selectedDate, allClasses]);

  // Cargar asistencia existente cuando se selecciona una clase y fecha
  useEffect(() => {
    if (selectedClass && selectedDate) {
      const newStudentAttendance = {};
      const relevantRecords = attendanceRecords.filter(
        record => record.classId === selectedClass.id && record.date === selectedDate
      );
      allClients.forEach(client => {
        const record = relevantRecords.find(r => r.clientId === client.id);
        newStudentAttendance[client.id] = record ? record.status : "Ausente"; // Por defecto 'Ausente'
      });
      setStudentAttendance(newStudentAttendance);
    }
  }, [selectedClass, selectedDate, attendanceRecords, allClients]);


  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleClassSelect = (classObj) => {
    setSelectedClass(classObj);
    // La carga de asistencia se maneja en el useEffect de arriba
  };

  const toggleStudentAttendance = (clientId) => {
    setStudentAttendance(prev => ({
      ...prev,
      [clientId]: prev[clientId] === "Presente" ? "Ausente" : "Presente"
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedClass || !selectedDate) {
      showError("Error", "Por favor, seleccione una fecha y una clase.");
      return;
    }

    let updatedRecords = [...attendanceRecords];
    let recordsChanged = false;

    allClients.forEach(client => {
      const status = studentAttendance[client.id] || "Ausente"; // Si no hay entrada, es Ausente
      const recordIndex = updatedRecords.findIndex(
        record => record.classId === selectedClass.id &&
                  record.clientId === client.id &&
                  record.date === selectedDate
      );

      if (recordIndex > -1) { // Actualizar registro existente
        if (updatedRecords[recordIndex].status !== status) {
          updatedRecords[recordIndex] = {
            ...updatedRecords[recordIndex],
            status: status,
            recordedAt: new Date().toISOString()
          };
          recordsChanged = true;
        }
      } else { // Crear nuevo registro
        updatedRecords.push({
          id: `record_${Date.now().toString()}_${client.id}`, // ID más único
          classId: selectedClass.id,
          className: selectedClass.name,
          clientId: client.id,
          clientName: client.name,
          date: selectedDate,
          status: status,
          recordedAt: new Date().toISOString()
        });
        recordsChanged = true;
      }
    });

    if (recordsChanged) {
      saveToLocalStorage(ATTENDANCE_RECORDS_STORAGE_KEY, updatedRecords);
      setAttendanceRecords(updatedRecords); // Actualizar estado local
      showSuccess("Asistencia Guardada", `La asistencia para ${selectedClass.name} el ${selectedDate} ha sido guardada.`);
    } else {
      showError("Sin Cambios", "No se detectaron cambios en la asistencia.");
    }
    // Opcional: resetear selección o mantenerla para modificaciones rápidas
    // setSelectedClass(null);
    // setStudentAttendance({});
  };


  return (
    <div>
      <button onClick={onBack} className="mb-6 text-orange-400 hover:text-orange-500 flex items-center">
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Volver al menú de Clases
      </button>

      <h2 className="text-2xl font-bold text-orange-400 mb-6">Registro de Asistencia</h2>

      {/* Selector de Fecha */}
      <div className="mb-6">
        <label htmlFor="attendanceDate" className="block text-sm font-medium text-gray-200 mb-1">
          Seleccionar Fecha:
        </label>
        <input
          type="date"
          id="attendanceDate"
          value={selectedDate}
          onChange={handleDateChange}
          className="bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Selección de Clase */}
      {selectedDate && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-orange-300 mb-2">Clases para el {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}:</h3>
          {classesForSelectedDate.length === 0 ? (
            <p className="text-gray-400">No hay clases programadas para esta fecha.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {classesForSelectedDate.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => handleClassSelect(cls)}
                  className={`p-3 rounded-md text-left w-full transition-all
                               ${selectedClass?.id === cls.id ? 'bg-orange-600 text-white ring-2 ring-orange-400' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                >
                  <p className="font-semibold">{cls.name}</p>
                  <p className="text-sm">{cls.startTime} - {cls.endTime} (Prof: {cls.instructor})</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lista de Alumnos para tomar asistencia */}
      {selectedClass && (
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4">
            Asistencia para: <span className="text-orange-400">{selectedClass.name}</span>
          </h3>
          {allClients.length === 0 ? (
             <p className="text-gray-400">No hay alumnos registrados para tomar asistencia.</p>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {allClients.map(client => (
              <li key={client.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                <span className="text-gray-100">{client.name}</span>
                <button
                  onClick={() => toggleStudentAttendance(client.id)}
                  className={`p-2 rounded-full transition-colors
                                ${studentAttendance[client.id] === "Presente" ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                  title={studentAttendance[client.id] === "Presente" ? "Marcar como Ausente" : "Marcar como Presente"}
                >
                  {studentAttendance[client.id] === "Presente" ?
                    <CheckCircleIcon className="w-5 h-5 text-white" /> :
                    <XCircleIcon className="w-5 h-5 text-white" />}
                </button>
              </li>
            ))}
          </ul>
          )}
          <button
            onClick={handleSaveAttendance}
            disabled={allClients.length === 0}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Guardar Asistencia
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceView;
