import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { showSuccess, showError, confirmAction } from '../utils/alerts';
import { getGymClasses, saveGymClasses, getTeachers } from '../utils/storage'; // Importar desde utils


const ManageClassesView = ({ onBack }) => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    profesor: '',
    dia: 'Lunes',
    horaInicio: '',
    horaFin: '',
    capacidad: '',
    activo: true
  });

  useEffect(() => {
    setClasses(getGymClasses()); // Usar la función importada
    setTeachers(getTeachers()); // Usar la función importada
  }, []);

  useEffect(() => {
    saveGymClasses(classes); // Usar la función importada
  }, [classes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const val = name === 'capacidad' ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const validateTime = (time) => /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(time);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validaciones requeridas
    if (!formData.nombre.trim() || !formData.profesor || !formData.dia || !formData.horaInicio || !formData.horaFin || isNaN(formData.capacidad) || formData.capacidad < 1) {
      showError('Campos Incompletos', 'Todos los campos son obligatorios y la capacidad debe ser al menos 1.');
      return;
    }
    if (!validateTime(formData.horaInicio) || !validateTime(formData.horaFin)) {
      showError('Formato de Hora Inválido', 'Por favor, ingrese la hora en formato HH:MM (ej: 09:00).');
      return;
    }
    if (formData.horaInicio >= formData.horaFin) {
      showError('Horario Inválido', 'La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    const newClass = {
      id: Date.now().toString(),
      ...formData,
      capacidad: Number(formData.capacidad)
    };

  setClasses(prevClasses => [...prevClasses, newClass]);
  showSuccess('addClass', newClass);
  setIsFormVisible(false);
  setFormData({ nombre: '', profesor: '', dia: 'Lunes', horaInicio: '', horaFin: '', capacidad: '', activo: true });
  };

  const handleDeleteClass = (classId, className) => {
    confirmAction('deleteClass', { nombre: className }, "Sí, eliminar", () => {
      setClasses(prevClasses => prevClasses.filter(cls => cls.id !== classId));
      showSuccess('deleteClass', { nombre: className });
    });
  };

  // Helper para obtener el nombre del profesor a partir de su ID
  const getTeacherName = (profesorId) => {
    const teacher = teachers.find(t => t.id === profesorId);
    return teacher ? `${teacher.nombre} ${teacher.apellido}` : 'Desconocido';
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
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-200">Nombre de la Clase</label>
            <input type="text" name="nombre" id="nombre" value={formData.nombre} onChange={handleInputChange}
              className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label htmlFor="profesor" className="block text-sm font-medium text-gray-200">Profesor</label>
            <select name="profesor" id="profesor" value={formData.profesor} onChange={handleInputChange}
              className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500">
              <option value="">Seleccione un profesor</option>
              {teachers.filter(t => t.activo !== false).map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.nombre} {teacher.apellido}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dia" className="block text-sm font-medium text-gray-200">Día de la Semana</label>
            <select name="dia" id="dia" value={formData.dia} onChange={handleInputChange}
              className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500">
              {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-200">Hora Inicio (HH:MM)</label>
              <input type="time" name="horaInicio" id="horaInicio" value={formData.horaInicio} onChange={handleInputChange}
                className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label htmlFor="horaFin" className="block text-sm font-medium text-gray-200">Hora Fin (HH:MM)</label>
              <input type="time" name="horaFin" id="horaFin" value={formData.horaFin} onChange={handleInputChange}
                className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>
          <div>
            <label htmlFor="capacidad" className="block text-sm font-medium text-gray-200">Capacidad Máxima</label>
            <input type="number" name="capacidad" id="capacidad" value={formData.capacidad} onChange={handleInputChange} min="1"
              className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, activo: !prev.activo }))}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none ${formData.activo ? 'bg-green-500' : 'bg-gray-500'}`}
              aria-pressed={formData.activo}
            >
              <span
                className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${formData.activo ? 'translate-x-7' : ''}`}
                style={{ transition: 'transform 0.2s' }}
              ></span>
              <span className="sr-only">Toggle Activo</span>
            </button>
            <span className={`text-sm font-semibold ${formData.activo ? 'text-green-400' : 'text-gray-400'}`}>{formData.activo ? 'Activo' : 'Inactivo'}</span>
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
                <p className="font-semibold text-white">{cls.nombre} <span className="text-sm text-gray-400">({cls.dia}, {cls.horaInicio}-{cls.horaFin})</span></p>
                <p className="text-sm text-gray-300">Profesor: {getTeacherName(cls.profesor)} - Capacidad: {cls.capacidad}</p>
                <p className="text-xs mt-1"><span className={cls.activo ? 'text-green-400' : 'text-red-400'}>{cls.activo ? 'Activo' : 'Inactivo'}</span></p>
              </div>
              <button
                onClick={() => handleDeleteClass(cls.id, cls.nombre)}
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