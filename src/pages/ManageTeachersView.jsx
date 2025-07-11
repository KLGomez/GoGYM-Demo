import React, { useState, useEffect, useContext } from 'react'; // Importar useContext
import { ArrowLeftIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
// Ya no se usa getTeachers/saveTeachers directamente
// import { getTeachers, saveTeachers } from '../utils/storage';
import { showSuccess, showError, confirmAction } from '../utils/alerts'; // Se usan para validaciones locales
import { SharedDataContext } from '../contexts/SharedDataContext'; // Importar el contexto


const ManageTeachersView = ({ onBack }) => {
  const {
    teachers: contextTeachers,
    // Asumimos que existirán estas funciones en el contexto:
    addTeacher: contextAddTeacher,
    updateTeacher: contextUpdateTeacher,
    deleteTeacher: contextDeleteTeacher,
    isLoading
  } = useContext(SharedDataContext);

  // const [teachers, setTeachers] = useState([]); // Se usará contextTeachers
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    email: '',
    phone: '',
    bio: ''
  });

  // Carga inicial y persistencia ya manejadas por el contexto.
  // useEffect(() => {
  //   setTeachers(getTeachers());
  // }, []);
  // useEffect(() => {
  //   saveTeachers(teachers);
  // }, [teachers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', specialty: '', email: '', phone: '', bio: '' });
    setEditingTeacher(null);
    setIsFormVisible(false); // Opcional: decidir si cerrar el form al resetear
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.specialty.trim()) {
      showError('Campos Obligatorios', 'Nombre y Especialidad son campos obligatorios.');
      return;
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        showError('Email Inválido', 'Por favor, ingrese un email válido.');
        return;
    }

    const teacherData = {
      ...formData,
      id: editingTeacher ? editingTeacher.id : `teach_${Date.now().toString()}`
    };

    if (editingTeacher) {
      contextUpdateTeacher(teacherData); // SweetAlert de éxito ya está en el contexto
    } else {
      contextAddTeacher(teacherData); // SweetAlert de éxito ya está en el contexto
    }
    resetForm();
    setIsFormVisible(false); // Siempre cerrar el form después de submit exitoso
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      specialty: teacher.specialty,
      email: teacher.email || '',
      phone: teacher.phone || '',
      bio: teacher.bio || ''
    });
    setIsFormVisible(true);
  };

  const handleDeleteTeacher = (teacherId, teacherName) => {
    confirmAction(
      `¿Eliminar Profesor "${teacherName}"?`,
      `Esta acción es irreversible. Si este profesor está asignado a clases, deberá reasignarlas.`, // Mensaje actualizado
      "Sí, eliminar",
      () => {
        contextDeleteTeacher(teacherId); // SweetAlert de éxito ya está en el contexto
        if(editingTeacher && editingTeacher.id === teacherId) {
          resetForm();
        }
      }
    );
  };

  if (isLoading && !contextTeachers) { // Mostrar carga si isLoading y contextTeachers aún no está poblado
    return <p className="text-gray-300">Cargando datos de profesores...</p>;
  }

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
            if (isFormVisible && editingTeacher) resetForm(); // Si estaba editando y presiona cancelar/cerrar form
            else if (isFormVisible && !editingTeacher) resetForm(); // Si estaba añadiendo y presiona cancelar
            setIsFormVisible(!isFormVisible);
            if (!isFormVisible) setEditingTeacher(null); // Al abrir el form para nuevo, asegurar no modo edición
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
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-200">Nombre Completo</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange}
                   className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" required />
          </div>
          <div>
            <label htmlFor="specialty" className="block text-sm font-medium text-gray-200">Especialidad Principal</label>
            <input type="text" name="specialty" id="specialty" value={formData.specialty} onChange={handleInputChange}
                   className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">Email (Opcional)</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange}
                   className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-200">Teléfono (Opcional)</label>
            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange}
                   className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-200">Biografía (Opcional)</label>
            <textarea name="bio" id="bio" value={formData.bio} onChange={handleInputChange} rows="3"
                      className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"></textarea>
          </div>
          <button type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow">
            {editingTeacher ? 'Actualizar Profesor' : 'Guardar Profesor'}
          </button>
           {isFormVisible && editingTeacher && ( // Botón de cancelar solo visible si se está editando
            <button type="button" onClick={resetForm}
                    className="mt-2 w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md shadow">
              Cancelar Edición
            </button>
          )}
        </form>
      )}

      <h3 className="text-xl font-semibold text-orange-400 mb-4">Lista de Profesores</h3>
      {(contextTeachers || []).length === 0 && !isLoading ? (
        <p className="text-gray-400">No hay profesores registrados.</p>
      ) : (
        <ul className="space-y-3">
          {(contextTeachers || []).map(teacher => (
            <li key={teacher.id} className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-white text-lg">{teacher.name}</p>
                  <p className="text-sm text-orange-300">{teacher.specialty}</p>
                  {teacher.email && <p className="text-xs text-gray-400">Email: {teacher.email}</p>}
                  {teacher.phone && <p className="text-xs text-gray-400">Tel: {teacher.phone}</p>}
                  {teacher.bio && <p className="text-xs text-gray-500 mt-1 italic">"{teacher.bio}"</p>}
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
                    onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Eliminar Profesor"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
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
