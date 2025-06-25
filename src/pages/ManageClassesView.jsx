import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { showSuccess, showError, confirmAction } from '../utils/alerts';

const GYM_CLASSES_STORAGE_KEY = 'gymClasses';
const GYM_TEACHERS_STORAGE_KEY = 'gymTeachers'; // Para leer los profesores

// LocalStorage helper functions for classes
const getGymClassesFromLocalStorage = () => {
  const classesJson = localStorage.getItem(GYM_CLASSES_STORAGE_KEY);
  return classesJson ? JSON.parse(classesJson) : [];
};

const saveGymClassesToLocalStorage = (classes) => {
  localStorage.setItem(GYM_CLASSES_STORAGE_KEY, JSON.stringify(classes));
};

// LocalStorage helper function for teachers
const getTeachersFromLocalStorage = () => {
  const teachersJson = localStorage.getItem(GYM_TEACHERS_STORAGE_KEY);
  return teachersJson ? JSON.parse(teachersJson) : [];
};


const ManageClassesView = ({ onBack }) => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]); // Estado para la lista de profesores
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    instructorId: '', // Cambiado de instructor a instructorId
    dayOfWeek: 'Lunes',
    startTime: '',
    endTime: '',
    capacity: '',
    description: ''
  });

  useEffect(() => {
    setClasses(getGymClassesFromLocalStorage());
    setTeachers(getTeachersFromLocalStorage()); // Cargar profesores al montar
  }, []);

  useEffect(() => {
    if (classes.length > 0 || localStorage.getItem(GYM_CLASSES_STORAGE_KEY)) {
        saveGymClassesToLocalStorage(classes);
    }
  }, [classes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const val = name === 'capacity' ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const validateTime = (time) => /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(time);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.instructorId) { // Validar instructorId
      showError('Campos Incompletos', 'El nombre de la clase y el instructor son obligatorios.');
      return;
    }
    // ... (otras validaciones existentes) ...
    if (!validateTime(formData.startTime) || !validateTime(formData.endTime)) {
      showError('Formato de Hora Inválido', 'Por favor, ingrese la hora en formato HH:MM (ej: 09:00).');
      return;
    }
    if (formData.startTime >= formData.endTime) {
      showError('Horario Inválido', 'La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }
    if (isNaN(formData.capacity) || formData.capacity <= 0) {
      showError('Capacidad Inválida', 'La capacidad máxima debe ser un número mayor a cero.');
      return;
    }

    const newClass = {
      id: Date.now().toString(),
      ...formData,
      capacity: Number(formData.capacity)
    };

    setClasses(prevClasses => [...prevClasses, newClass]);
    showSuccess('Clase Agregada', `${newClass.name} ha sido agregada exitosamente.`);
    setIsFormVisible(false);
    setFormData({ name: '', instructorId: '', dayOfWeek: 'Lunes', startTime: '', endTime: '', capacity: '', description: '' });
  };

  const handleDeleteClass = (classId, className) => {
    confirmAction(`¿Eliminar Clase "${className}"?`, `Estás a punto de eliminar la clase ${className}. Esta acción es irreversible.`, "Sí, eliminar", () => {
      setClasses(prevClasses => prevClasses.filter(cls => cls.id !== classId));
      showSuccess('Clase Eliminada', `La clase ${className} ha sido eliminada.`);
    });
  };

  // Helper para obtener el nombre del instructor a partir de su ID
  const getInstructorName = (instructorId) => {
    const teacher = teachers.find(t => t.id === instructorId);
    return teacher ? teacher.name : 'Desconocido';
  };

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
        <h2 className="text-2xl font-bold text-orange-400">Añadir/Eliminar Clases</h2>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md shadow flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          {isFormVisible ? 'Cancelar Alta' : 'Añadir Nueva Clase'}
        </button>
      </div>

      {isFormVisible && (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl bg-gray-800 p-6 rounded-lg mb-8">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-200">Nombre de la Clase</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange}
                   className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label htmlFor="instructorId" className="block text-sm font-medium text-gray-200">Instructor</label>
            <select name="instructorId" id="instructorId" value={formData.instructorId} onChange={handleInputChange}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500">
              <option value="">Seleccione un instructor</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.specialty})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-200">Día de la Semana</label>
            <select name="dayOfWeek" id="dayOfWeek" value={formData.dayOfWeek} onChange={handleInputChange}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500">
              {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          {/* ... (resto de los campos del formulario: startTime, endTime, capacity, description sin cambios) ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-200">Hora Inicio (HH:MM)</label>
              <input type="time" name="startTime" id="startTime" value={formData.startTime} onChange={handleInputChange}
                     className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-200">Hora Fin (HH:MM)</label>
              <input type="time" name="endTime" id="endTime" value={formData.endTime} onChange={handleInputChange}
                     className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-200">Capacidad Máxima</label>
            <input type="number" name="capacity" id="capacity" value={formData.capacity} onChange={handleInputChange} min="1"
                   className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-200">Descripción (Opcional)</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleInputChange} rows="3"
                      className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"></textarea>
          </div>
          <button type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow">
            Guardar Clase
          </button>
        </form>
      )}

      <h3 className="text-xl font-semibold text-orange-400 mb-4">Clases Existentes</h3>
      {classes.length === 0 ? (
        <p className="text-gray-400">No hay clases registradas todavía.</p>
      ) : (
        <ul className="space-y-3">
          {classes.map(cls => (
            <li key={cls.id} className="bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center">
              <div>
                <p className="font-semibold text-white">{cls.name} <span className="text-sm text-gray-400">({cls.dayOfWeek}, {cls.startTime}-{cls.endTime})</span></p>
                <p className="text-sm text-gray-300">Instructor: {getInstructorName(cls.instructorId)} - Capacidad: {cls.capacity}</p>
                {cls.description && <p className="text-xs text-gray-400 mt-1">Descripción: {cls.description}</p>}
              </div>
              <button
                onClick={() => handleDeleteClass(cls.id, cls.name)}
                className="text-red-500 hover:text-red-700"
                title="Eliminar Clase"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageClassesView;
