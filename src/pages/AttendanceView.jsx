import React, { useState, useEffect, useMemo, useContext } from 'react';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { showSuccess, showError } from '../utils/alerts'; // Para alertas locales si son necesarias
import { SharedDataContext } from '../contexts/SharedDataContext'; // Importar el contexto

const getDayOfWeekInSpanish = (dateString) => {
    const date = new Date(dateString + 'T00:00:00'); // Asegurar que se interprete como fecha local
    const dayIndex = date.getUTCDay(); // Usar getUTCDay para consistencia si las fechas no tienen zona horaria
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return days[dayIndex];
};

const AttendanceView = ({ onBack }) => {
  const {
    gymClasses: contextGymClasses,
    clients: contextClients,
    enrollments: contextEnrollments,
    attendanceRecords: contextAttendanceRecords,
    addAttendanceRecord, // Asumimos que esta función se refinará para actualizar o añadir
    isLoading,
    teachers: contextTeachers
  } = useContext(SharedDataContext);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [classesForSelectedDate, setClassesForSelectedDate] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState({}); // { [clientId]: "Presente" | "Ausente" }

  // Cargar clases para la fecha seleccionada
  useEffect(() => {
    if (selectedDate && contextGymClasses) {
      const dayName = getDayOfWeekInSpanish(selectedDate);
      // El modelo de clase en el contexto usa 'day', no 'dayOfWeek'
      const filtered = contextGymClasses.filter(cls => cls.day === dayName).sort((a,b) => (a.time || a.startTime).localeCompare(b.time || b.startTime));
      setClassesForSelectedDate(filtered);
      setSelectedClass(null); // Resetear clase seleccionada al cambiar fecha
      setStudentAttendance({}); // Resetear estado de asistencia
    }
  }, [selectedDate, contextGymClasses]);

  const getInstructorName = (instructorId) => {
    if (!contextTeachers) return '';
    const teacher = contextTeachers.find(t => t.id === instructorId);
    return teacher ? teacher.name : 'Desconocido';
  };

  // Obtener alumnos inscritos para la clase seleccionada
  const enrolledStudentsForSelectedClass = useMemo(() => {
    if (!selectedClass || !contextEnrollments || !contextClients) return [];
    const enrolledClientIds = contextEnrollments
      .filter(enrollment => enrollment.classId === selectedClass.id)
      .map(enrollment => enrollment.userId); // userId según el modelo del contexto
    return contextClients.filter(client => enrolledClientIds.includes(client.id));
  }, [selectedClass, contextEnrollments, contextClients]);

  // Cargar el estado de asistencia guardado cuando se selecciona una clase o cambia la fecha
  useEffect(() => {
    if (selectedClass && selectedDate && enrolledStudentsForSelectedClass.length > 0 && contextAttendanceRecords) {
      const newStudentAttendance = {};
      const relevantRecords = contextAttendanceRecords.filter(
        record => record.classId === selectedClass.id && record.date === selectedDate
      );
      enrolledStudentsForSelectedClass.forEach(client => {
        const record = relevantRecords.find(r => r.clientId === client.id);
        newStudentAttendance[client.id] = record ? record.status : "Ausente"; // Default a Ausente
      });
      setStudentAttendance(newStudentAttendance);
    } else if (selectedClass) {
        setStudentAttendance({});
    }
  }, [selectedClass, selectedDate, contextAttendanceRecords, enrolledStudentsForSelectedClass]);


  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleClassSelect = (classObj) => {
    setSelectedClass(classObj);
    // El useEffect anterior se encargará de cargar la asistencia para esta nueva clase
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
    if (enrolledStudentsForSelectedClass.length === 0) {
        showError("Sin Alumnos", "No hay alumnos inscritos en esta clase para tomar asistencia.");
        return;
    }

    let changesMade = false;
    enrolledStudentsForSelectedClass.forEach(client => {
      const currentStatusInContext = contextAttendanceRecords.find(
        r => r.clientId === client.id && r.classId === selectedClass.id && r.date === selectedDate
      )?.status || "Ausente";
      const newStatus = studentAttendance[client.id] || "Ausente";

      if (currentStatusInContext !== newStatus) {
        changesMade = true;
      }
      // addAttendanceRecord debería manejar la lógica de si es un nuevo registro o una actualización.
      // Por ahora, asumimos que addAttendanceRecord crea uno nuevo si no existe con ese ID,
      // o se podría necesitar una función `updateAttendanceRecord`.
      // Para simplificar, vamos a asumir que el contexto puede manejar la lógica de "upsert".
      // Una forma más simple es que addAttendanceRecord SIEMPRE añada, y luego filtremos el último para un ID.
      // O mejor, que addAttendanceRecord reemplace si ya existe uno para ese client/class/date.
      // Para este ejemplo, la función addAttendanceRecord en el contexto necesitará ser más inteligente.
      // O, aquí filtramos los que no han cambiado y solo llamamos a addAttendanceRecord para los nuevos/modificados.
      // Por ahora, llamaremos a addAttendanceRecord para todos, y el contexto debería manejarlo.
      // Es importante que la función en el contexto evite duplicados o actualice correctamente.
      // Una mejora sería que `addAttendanceRecord` tome el array completo de asistencia para la clase y lo guarde.
      // Pero para mantenerlo simple con la función actual:
      addAttendanceRecord({
        // id: se genera en el contexto o se busca para actualizar
        classId: selectedClass.id,
        className: selectedClass.name,
        clientId: client.id,
        clientName: `${client.firstName} ${client.lastName}`,
        date: selectedDate,
        status: newStatus,
        recordedAt: new Date().toISOString()
      });
    });

    // La notificación de éxito debería venir del contexto o si hubo cambios.
    // Por ahora, si llamamos a addAttendanceRecord, asumimos que se guarda.
    // El problema es que si no hay cambios, igual se llama.
    if (changesMade) {
        showSuccess("Asistencia Guardada", `La asistencia para ${selectedClass.name} el ${selectedDate} ha sido actualizada.`);
    } else {
        showError("Sin Cambios", "No se detectaron cambios en la asistencia para guardar.");
    }
    // No es necesario recargar `contextAttendanceRecords` aquí, el contexto se encarga.
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

      <h2 className="text-2xl font-bold text-orange-400 mb-6">Registro de Asistencia</h2>

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
                  <p className="text-sm">{cls.time || cls.startTime} - {cls.endTime || cls.duration} (Prof: {getInstructorName(cls.instructorId)})</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedClass && (
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4">
            Asistencia para: <span className="text-orange-400">{selectedClass.name}</span>
          </h3>
          {enrolledStudentsForSelectedClass.length === 0 ? (
             <p className="text-gray-400">No hay alumnos inscritos en esta clase para tomar asistencia.</p>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {enrolledStudentsForSelectedClass.map(client => (
              <li key={client.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                <span className="text-gray-100">{client.firstName} {client.lastName}</span>
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
            disabled={enrolledStudentsForSelectedClass.length === 0}
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
