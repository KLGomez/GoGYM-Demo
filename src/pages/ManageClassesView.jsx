import React, { useState, useEffect, useContext } from 'react'; // Importar useContext
import { ArrowLeftIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'; // Añadir PencilIcon
import { showSuccess, showError, confirmAction } from '../utils/alerts';
// Las funciones de storage ya no se usan directamente, se accede vía contexto
// import { getGymClasses, saveGymClasses, getTeachers } from '../utils/storage';
import { SharedDataContext } from '../contexts/SharedDataContext'; // Importar el contexto


const ManageClassesView = ({ onBack }) => {
  const {
    gymClasses: contextGymClasses,
    addGymClass,
    updateGymClass,
    deleteGymClass,
    teachers: contextTeachers, // Asumimos que los profesores también están en el contexto
    isLoading
  } = useContext(SharedDataContext);

  // const [classes, setClasses] = useState([]); // Se usará contextGymClasses
  // const [teachers, setTeachers] = useState([]); // Se usará contextTeachers
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingClass, setEditingClass] = useState(null); // Para modo edición
  const [formData, setFormData] = useState({
    name: '',
    instructorId: '', // Cambiado de instructor a instructorId
    day: 'Lunes', // Cambiado de dayOfWeek a day para coincidir con el modelo de datos del contexto
    time: '', // Un solo campo para la hora, ej: "08:00 AM" o se puede mantener startTime y calcular duration.
              // Por ahora, simplificaremos a un solo campo 'time' y 'duration'.
    startTime: '', // Mantendremos startTime y endTime para la lógica de validación y cálculo de duration
    endTime: '',
    duration: '', // Se calculará o se puede añadir como campo
    capacity: '',
    enrolled: 0, // Añadir enrolled, por defecto 0 al crear
    description: '',
    location: '' // Añadir location
  });

  // No es necesario cargar clases y profesores con useEffect si vienen del contexto
  // useEffect(() => {
  //   setClasses(getGymClasses());
  //   setTeachers(getTeachers());
  // }, []);

  // La persistencia la maneja el contexto
  // useEffect(() => {
  //   saveGymClasses(classes);
  // }, [classes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Mantener la conversión a número para capacity
    const val = name === 'capacity' ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const validateTime = (time) => /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(time);

  const resetForm = () => {
    setFormData({
      name: '', instructorId: '', day: 'Lunes', startTime: '', endTime: '',
      duration: '', capacity: '', enrolled: 0, description: '', location: ''
    });
    setEditingClass(null); // Salir del modo edición
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startDate = new Date(0, 0, 0, sh, sm);
    const endDate = new Date(0, 0, 0, eh, em);
    let diff = endDate.getTime() - startDate.getTime();
    if (diff < 0) diff += 24 * 60 * 60 * 1000; // Handle overnight classes if necessary, though usually not for gyms
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}min`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.instructorId) {
      showError('Campos Incompletos', 'El nombre de la clase y el instructor son obligatorios.');
      return;
    }
    if (!validateTime(formData.startTime) || !validateTime(formData.endTime)) {
      showError('Formato de Hora Inválido', 'Por favor, ingrese la hora en formato HH:MM (ej: 09:00).');
      return;
    }
    if (formData.startTime >= formData.endTime) { // Podría necesitar lógica más compleja para clases que cruzan medianoche
      showError('Horario Inválido', 'La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }
    if (isNaN(formData.capacity) || Number(formData.capacity) <= 0) {
      showError('Capacidad Inválida', 'La capacidad máxima debe ser un número mayor a cero.');
      return;
    }
    if (!formData.location.trim()) {
        showError('Campo Incompleto', 'La ubicación de la clase es obligatoria.');
        return;
    }

    const classData = {
      ...formData,
      id: editingClass ? editingClass.id : `class_${Date.now().toString()}`,
      capacity: Number(formData.capacity),
      // El campo 'time' se puede construir a partir de startTime o ser un campo separado.
      // Para mantener consistencia con el modelo de UserClasses:
      time: formData.startTime, // O el formato que se prefiera mostrar, ej: "08:00 AM"
      duration: calculateDuration(formData.startTime, formData.endTime),
      // 'enrolled' se mantiene si se edita, o se inicializa en 0 si es nueva y no se proveyó
      enrolled: editingClass ? (formData.enrolled || editingClass.enrolled) : (formData.enrolled || 0),
    };

    if (editingClass) {
      updateGymClass(classData); // SweetAlert de éxito ya está en el contexto
    } else {
      addGymClass(classData); // SweetAlert de éxito ya está en el contexto
    }

    setIsFormVisible(false);
    resetForm();
  };

  const handleEditClass = (classToEdit) => {
    setEditingClass(classToEdit);
    setFormData({
      name: classToEdit.name,
      instructorId: classToEdit.instructorId,
      day: classToEdit.day,
      startTime: classToEdit.startTime || classToEdit.time, // Priorizar startTime si existe
      endTime: classToEdit.endTime || '', // Si no hay endTime, el admin deberá ingresarlo
      duration: classToEdit.duration, // Se puede recalcular o mostrar
      capacity: classToEdit.capacity,
      enrolled: classToEdit.enrolled,
      description: classToEdit.description || '',
      location: classToEdit.location || ''
    });
    setIsFormVisible(true);
  };

  const handleDeleteClass = (classId, className) => {
    confirmAction(
      `¿Eliminar Clase "${className}"?`,
      `Estás a punto de eliminar la clase ${className}. Esta acción es irreversible y desinscribirá a todos los alumnos.`,
      "Sí, eliminar",
      () => {
        deleteGymClass(classId); // SweetAlert de éxito ya está en el contexto
      }
    );
  };

  const getInstructorName = (instructorId) => {
    if (!contextTeachers) return 'Cargando...';
    const teacher = contextTeachers.find(t => t.id === instructorId);
    return teacher ? teacher.name : 'Desconocido';
  };

  if (isLoading && (!contextGymClasses || !contextTeachers)) {
    return <p className="text-gray-300">Cargando datos de clases e instructores...</p>;
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 text-orange-400 hover:text-orange-500 flex items-center"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Volver al menú de Clases
      </button>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-orange-400">
          {editingClass ? "Editar Clase" : "Añadir/Gestionar Clases"}
        </h2>
        <button
          onClick={() => {
            if (isFormVisible && editingClass) resetForm(); // Si estaba editando y cierra, resetea
            else if (isFormVisible && !editingClass) resetForm(); // Si estaba añadiendo y cierra, resetea
            setIsFormVisible(!isFormVisible);
            if (editingClass && !isFormVisible) setEditingClass(null); // Si abre el form sin editar, limpiar editingClass
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md shadow flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          {isFormVisible ? 'Cancelar' : 'Añadir Nueva Clase'}
        </button>
      </div>

      {isFormVisible && (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl bg-gray-800 p-6 rounded-lg mb-8">
          {/* Nombre de la Clase */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-200">Nombre de la Clase</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange}
                   className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" required />
          </div>
          {/* Instructor */}
          <div>
            <label htmlFor="instructorId" className="block text-sm font-medium text-gray-200">Instructor</label>
            <select name="instructorId" id="instructorId" value={formData.instructorId} onChange={handleInputChange}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" required>
              <option value="">Seleccione un instructor</option>
              {(contextTeachers || []).map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.specialty})</option>
              ))}
            </select>
          </div>
          {/* Día de la Semana */}
          <div>
            <label htmlFor="day" className="block text-sm font-medium text-gray-200">Día de la Semana</label>
            <select name="day" id="day" value={formData.day} onChange={handleInputChange}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500">
              {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          {/* Hora Inicio y Fin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-200">Hora Inicio (HH:MM)</label>
              <input type="time" name="startTime" id="startTime" value={formData.startTime} onChange={handleInputChange}
                     className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" required />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-200">Hora Fin (HH:MM)</label>
              <input type="time" name="endTime" id="endTime" value={formData.endTime} onChange={handleInputChange}
                     className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" required />
            </div>
          </div>
           {/* Ubicación */}
           <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-200">Ubicación</label>
            <input type="text" name="location" id="location" value={formData.location} onChange={handleInputChange}
                   className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Ej: Sala Zen, Área Crossfit" required />
          </div>
          {/* Capacidad Máxima */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-200">Capacidad Máxima</label>
            <input type="number" name="capacity" id="capacity" value={formData.capacity} onChange={handleInputChange} min="1"
                   className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" required />
          </div>
          {/* Descripción (Opcional) */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-200">Descripción (Opcional)</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleInputChange} rows="3"
                      className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"></textarea>
          </div>
          <button type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow">
            {editingClass ? 'Actualizar Clase' : 'Guardar Clase'}
          </button>
        </form>
      )}

      <h3 className="text-xl font-semibold text-orange-400 mb-4 mt-8">Clases Existentes</h3>
      {(contextGymClasses || []).length === 0 && !isLoading ? (
        <p className="text-gray-400">No hay clases registradas todavía.</p>
      ) : (
        <ul className="space-y-3">
          {(contextGymClasses || []).map(cls => (
            <li key={cls.id} className="bg-gray-800 p-4 rounded-lg shadow flex justify-between items-start">
              <div>
                <p className="font-semibold text-white">{cls.name}
                  <span className="text-sm text-gray-400 ml-2">({cls.day}, {cls.time || cls.startTime} - {cls.endTime ? cls.endTime : cls.duration})</span>
                </p>
                <p className="text-sm text-gray-300">Instructor: {getInstructorName(cls.instructorId)} - Cupos: {cls.enrolled}/{cls.capacity} - Lugar: {cls.location}</p>
                {cls.description && <p className="text-xs text-gray-400 mt-1">Desc: {cls.description}</p>}
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                <button
                  onClick={() => handleEditClass(cls)}
                  className="text-blue-400 hover:text-blue-600 p-1"
                  title="Editar Clase"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteClass(cls.id, cls.name)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Eliminar Clase"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageClassesView;
