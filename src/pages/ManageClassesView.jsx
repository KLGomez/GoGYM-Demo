import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { showSuccess, showError, confirmAction } from '../utils/alerts';
import { getClasses, createClass, updateClass, deleteClass, deactivateClass, reactivateClass } from '../api/classes';
import ClassEditForm from '../components/ClassEditForm';
import { getTeachers } from '../api/teachers';


const ManageClassesView = ({ onBack }) => {
  const [editingClass, setEditingClass] = useState(null);
  const [view, setView] = useState('list');
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    profesor: '',
    dia: 'Lunes',
    horaInicio: '',
    horaFin: '',
    capacidad: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('[ManageClassesView] Token JWT:', token);
        const [classesData, teachersData] = await Promise.all([
          getClasses(),
          getTeachers(token)
        ]);
        console.log('[ManageClassesView] Clases:', classesData);
        console.log('[ManageClassesView] Profesores:', teachersData);
        setClasses(Array.isArray(classesData) ? classesData : []);
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      } catch (error) {
        console.error('[ManageClassesView] Error al cargar datos:', error);
        showError('Error al cargar datos de clases o profesores');
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'capacidad') {
      val = parseInt(value, 10);
    }
    // Log para depurar el valor seleccionado de profesor
    if (name === 'profesor') {
      console.log('[ManageClassesView] Profesor seleccionado (ID):', val);
    }
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const validateTime = (time) => /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(time);

  const handleSubmit = async (e) => {
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

    try {
      // Log de los datos antes de construir el payload
      console.log('[ManageClassesView] formData antes de enviar:', formData);
      const payload = {
        nombre: formData.nombre,
        profesor: formData.profesor,
        dia: formData.dia,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        capacidad: Number(formData.capacidad)
      };
      // Validar si el ID de profesor parece un ObjectId
      const objectIdRegex = /^[a-f\d]{24}$/i;
      if (!objectIdRegex.test(payload.profesor)) {
        console.warn('[ManageClassesView] El ID de profesor no tiene formato de MongoDB ObjectId:', payload.profesor);
      }
      console.log('[ManageClassesView] Payload enviado al backend:', payload);
      const created = await createClass(payload);
      setClasses(prev => [...prev, created]);
      showSuccess('Clase Agregada', `${created.nombre} ha sido agregada exitosamente.`);
      setIsFormVisible(false);
      setFormData({ nombre: '', profesor: '', dia: 'Lunes', horaInicio: '', horaFin: '', capacidad: '' });
    } catch (error) {
      console.error('[ManageClassesView] Error al guardar la clase:', error?.response?.data || error);
      showError('Error al guardar la clase');
    }
  };

  const handleDeleteClass = async (classId, className) => {
    confirmAction(`¿Eliminar Clase "${className}"?`, `Estás a punto de eliminar la clase ${className}. Esta acción es irreversible.`, "Sí, eliminar", async () => {
      try {
        await deleteClass(classId);
        // Recargar la lista desde el backend para evitar inconsistencias
        const updatedClasses = await getClasses();
        setClasses(Array.isArray(updatedClasses) ? updatedClasses : []);
        showSuccess('Clase Eliminada', `La clase ${className} ha sido eliminada.`);
      } catch (error) {
        showError('Error al eliminar la clase');
      }
    });
  };

  // Helper para obtener el nombre del profesor a partir de su ID
  const getTeacherName = (profesorId) => {
    const teacher = teachers.find(t => t._id === profesorId || t.id === profesorId);
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
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-2 rounded-md shadow flex items-center gap-2"
        >
          {/* <PlusIcon className="w-5 h-5" /> */}
          {isFormVisible ? 'Cancelar Alta' : 'Añadir Nueva Clase'}
        </button>
      </div>

      {view === 'edit' ? (
        <ClassEditForm
          initialData={editingClass}
          teachers={teachers}
          onSubmit={async (data) => {
            try {
              const updated = await updateClass(editingClass._id || editingClass.id, data);
              showSuccess('Clase actualizada', `${updated.nombre} actualizada correctamente.`);
              setView('list');
              setEditingClass(null);
              // Recargar lista
              const updatedClasses = await getClasses();
              setClasses(Array.isArray(updatedClasses) ? updatedClasses : []);
            } catch (error) {
              showError('Error al actualizar la clase');
            }
          }}
          onCancel={() => {
            setView('list');
            setEditingClass(null);
          }}
        />
      ) : (
        <>
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
                  <option value="">Selecciona un profesor</option>
                  {teachers.filter(t => t.activo !== false).map(teacher => (
                    <option key={teacher._id || teacher.id} value={teacher._id || teacher.id}>{teacher.nombre} {teacher.apellido}</option>
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
                <li key={cls._id || cls.id} className="bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">{cls.nombre} <span className="text-sm text-gray-400">({cls.dia}, {cls.horaInicio}-{cls.horaFin})</span></p>
                    {(() => {
                      const getTeacherData = (profesor) => {
                        if (!profesor) return null;
                        if (typeof profesor === 'object') return profesor;
                        return teachers.find(t => t._id === profesor || t.id === profesor);
                      };
                      const teacher = getTeacherData(cls.profesor);
                      if (!teacher) return <p className="text-sm text-gray-300">Profesor: Desconocido</p>;
                      return (
                        <div className="text-sm text-gray-300 space-y-1">
                          <p>Profesor: <span className="font-semibold text-orange-300">{teacher.nombre} {teacher.apellido}</span></p>
                          {teacher.especialidades && <p>Especialidad: <span className="text-orange-200">{teacher.especialidades}</span></p>}
                          {teacher.email && <p>Email: <span className="text-orange-200">{teacher.email}</span></p>}
                          {teacher.telefono && <p>Teléfono: <span className="text-orange-200">{teacher.telefono}</span></p>}
                          {teacher.descripcion && <p>Descripción: <span className="text-orange-200">{teacher.descripcion}</span></p>}
                        </div>
                      );
                    })()}
                    <p className="text-sm text-gray-300">Capacidad: {cls.capacidad}</p>
                    <p className="text-xs mt-1"><span className={cls.activo ? 'text-green-400' : 'text-red-400'}>{cls.activo ? 'Activo' : 'Inactivo'}</span></p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => { setEditingClass(cls); setView('edit'); }}
                      className="text-blue-500 hover:text-blue-700"
                      title="Editar Clase"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.125 2.125 0 113.006 3.006L7.5 19.862l-4 1 1-4 12.362-12.375z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls._id || cls.id, cls.nombre)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar Clase"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    {cls.activo ? (
                      <button
                        onClick={async () => {
                          await deactivateClass(cls._id || cls.id);
                          setClasses(prev => prev.map(c => {
                            const cid = c._id || c.id;
                            const clsid = cls._id || cls.id;
                            return cid === clsid ? { ...c, activo: false } : c;
                          }));
                          showSuccess('Clase inactivada', `La clase ${cls.nombre} ha sido desactivada.`);
                        }}
                        className="text-yellow-400 hover:text-yellow-600 p-0 font-bold cursor-pointer text-base underline"
                        title="Inactivar Clase"
                      >
                        Inactivar
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          await reactivateClass(cls._id || cls.id);
                          setClasses(prev => prev.map(c => {
                            const cid = c._id || c.id;
                            const clsid = cls._id || cls.id;
                            return cid === clsid ? { ...c, activo: true } : c;
                          }));
                          showSuccess('Clase activada', `La clase ${cls.nombre} ha sido activada.`);
                        }}
                        className="text-green-400 hover:text-green-600 p-0 font-bold cursor-pointer text-base underline"
                        title="Activar Clase"
                      >
                        Activar
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default ManageClassesView;