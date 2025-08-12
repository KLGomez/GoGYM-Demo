import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  deactivateTeacher,
  reactivateTeacher
} from '../api/teachers';
// Suponiendo que las alertas reales se importarán de utils/alerts
import { showSuccess, showError, confirmAction } from '../utils/alerts';


const ManageTeachersView = ({ onBack }) => {
  const [teachers, setTeachers] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    descripcion: '',
    especialidades: '',
    activo: true
  });

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem('token');
        // Pedir todos los profesores, incluyendo los inactivos
        const res = await fetch(`${import.meta.env.VITE_API_URL}/teachers?includeInactive=true`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setTeachers(data);
      } catch (error) {
        showError('error', { message: 'No se pudieron cargar los profesores.' });
      }
    };
    fetchTeachers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      descripcion: '',
      especialidades: '',
      activo: true
    });
    setEditingTeacher(null);
    setIsFormVisible(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validaciones requeridas
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.dni.trim() || !formData.email.trim() || !formData.telefono.trim() || !formData.descripcion.trim() || !formData.especialidades.trim()) {
      showError('error', { message: 'Todos los campos son obligatorios excepto "activo".' });
      return;
    }
    // Validación de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showError('error', { message: 'Por favor, ingrese un email válido.' });
      return;
    }
    // Validación de unicidad de email y dni
    const emailExists = teachers.some(t => t.email === formData.email && (!editingTeacher || t.id !== editingTeacher.id));
    if (emailExists) {
      showError('error', { message: 'Ya existe un profesor con ese email.' });
      return;
    }
    const dniExists = teachers.some(t => t.dni === formData.dni && (!editingTeacher || t.id !== editingTeacher.id));
    if (dniExists) {
      showError('error', { message: 'Ya existe un profesor con ese DNI.' });
      return;
    }

    const token = localStorage.getItem('token');
    if (editingTeacher) {
      updateTeacher(editingTeacher._id, formData, token)
        .then(updated => {
          setTeachers(teachers.map(t => t._id === updated._id ? updated : t));
          showSuccess('updateTeacher', updated);
          resetForm();
        })
        .catch(() => showError('error', { message: 'No se pudo actualizar el profesor.' }));
    } else {
      createTeacher(formData, token)
        .then(created => {
          setTeachers(prev => [...prev, created]);
          showSuccess('addTeacher', created);
          resetForm();
        })
        .catch(() => showError('error', { message: 'No se pudo crear el profesor.' }));
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      nombre: teacher.nombre || '',
      apellido: teacher.apellido || '',
      dni: teacher.dni || '',
      email: teacher.email || '',
      telefono: teacher.telefono || '',
      descripcion: teacher.descripcion || '',
      especialidades: teacher.especialidades || '',
      activo: typeof teacher.activo === 'boolean' ? teacher.activo : true
    });
    setIsFormVisible(true);
  };

  const handleDeleteTeacher = (teacherId, teacherName) => {
    confirmAction('deleteTeacher', { nombre: teacherName }, "Sí, eliminar", () => {
      const token = localStorage.getItem('token');
      deleteTeacher(teacherId, token)
        .then(() => {
          setTeachers(prev => prev.filter(t => t._id !== teacherId));
          showSuccess('deleteTeacher', { nombre: teacherName });
          if (editingTeacher && editingTeacher._id === teacherId) {
            resetForm();
          }
        })
        .catch(() => showError('error', { message: 'No se pudo eliminar el profesor.' }));
    });
  };

  return (
    <div>
      <button onClick={onBack} className="mb-6 text-orange-400 hover:text-orange-500 flex items-center">
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Volver al menú de Clases
      </button>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-orange-400">Gestión de Profesores</h2>
        <button
          onClick={() => {
            setIsFormVisible(!isFormVisible);
            if (isFormVisible) resetForm(); // Si se cierra el form, resetearlo
            else setEditingTeacher(null); // Asegurar que no esté en modo edición al abrir
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md shadow flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          {isFormVisible ? 'Cancelar' : 'Añadir Nuevo Profesor'}
        </button>
      </div>

      {isFormVisible && (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl bg-gray-800 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold text-white mb-3">{editingTeacher ? 'Editar Profesor' : 'Añadir Nuevo Profesor'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-200">Nombre</label>
              <input type="text" name="nombre" id="nombre" value={formData.nombre} onChange={handleInputChange}
                className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-200">Apellido</label>
              <input type="text" name="apellido" id="apellido" value={formData.apellido} onChange={handleInputChange}
                className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-gray-200">DNI</label>
              <input type="text" name="dni" id="dni" value={formData.dni} onChange={handleInputChange}
                className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">Email</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange}
                className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-200">Teléfono</label>
              <input type="text" name="telefono" id="telefono" value={formData.telefono} onChange={handleInputChange}
                className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label htmlFor="especialidades" className="block text-sm font-medium text-gray-200">Especialidades</label>
              <input type="text" name="especialidades" id="especialidades" value={formData.especialidades} onChange={handleInputChange}
                placeholder="Ej: Yoga, Meditación" className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-200">Descripción</label>
            <textarea name="descripcion" id="descripcion" value={formData.descripcion} onChange={handleInputChange} rows="3"
              className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"></textarea>
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
            {editingTeacher ? 'Actualizar Profesor' : 'Guardar Profesor'}
          </button>
          {isFormVisible && editingTeacher && (
            <button type="button" onClick={resetForm}
              className="mt-2 w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md shadow">
              Cancelar Edición
            </button>
          )}
        </form>
      )}

      <h3 className="text-xl font-semibold text-orange-400 mb-4">Lista de Profesores</h3>
      {teachers.length === 0 ? (
        <p className="text-gray-400">No hay profesores registrados.</p>
      ) : (
        <ul className="space-y-3">
          {teachers.map(teacher => (
            <li key={teacher._id} className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-white text-lg">{teacher.nombre} {teacher.apellido}</p>
                  <p className="text-sm text-orange-300">Especialidades: {teacher.especialidades}</p>
                  <p className="text-xs text-gray-400">DNI: {teacher.dni}</p>
                  <p className="text-xs text-gray-400">Email: {teacher.email}</p>
                  <p className="text-xs text-gray-400">Tel: {teacher.telefono}</p>
                  <p className="text-xs text-gray-500 mt-1 italic">{teacher.descripcion}</p>
                  <p className="text-xs mt-1"><span className={teacher.activo ? 'text-green-400' : 'text-red-400'}>{teacher.activo ? 'Activo' : 'Inactivo'}</span></p>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleEditTeacher(teacher)}
                    className="text-blue-400 hover:text-blue-600 p-1"
                    title="Editar Profesor"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeacher(teacher._id, `${teacher.nombre} ${teacher.apellido}`)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Eliminar Profesor"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                  {teacher.activo ? (
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('token');
                        await deactivateTeacher(teacher._id, token);
                        setTeachers(prev => prev.map(t => t._id === teacher._id ? { ...t, activo: false } : t));
                      }}
                      className="text-yellow-400 hover:text-yellow-600 p-1"
                      title="Desactivar Profesor"
                    >
                      Inactivar
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('token');
                        await reactivateTeacher(teacher._id, token);
                        setTeachers(prev => prev.map(t => t._id === teacher._id ? { ...t, activo: true } : t));
                      }}
                      className="text-green-400 hover:text-green-600 p-1"
                      title="Reactivar Profesor"
                    >
                      Activar
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageTeachersView;