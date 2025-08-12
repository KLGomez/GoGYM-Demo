import React from 'react';

const ClassEditForm = ({ initialData, teachers, onSubmit, onCancel }) => {
    const [formData, setFormData] = React.useState({
        nombre: initialData?.nombre || '',
        profesor: initialData?.profesor?._id || initialData?.profesor || '',
        dia: initialData?.dia || 'Lunes',
        horaInicio: initialData?.horaInicio || '',
        horaFin: initialData?.horaFin || '',
        capacidad: initialData?.capacidad || 1,
        activo: typeof initialData?.activo === 'boolean' ? initialData.activo : true,
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let val = type === 'number' ? parseInt(value, 10) : value;
        if (name === 'activo') val = !formData.activo;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg bg-gray-800 p-6 rounded-lg shadow-xl">
            <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-200">Nombre de la Clase</label>
                <input type="text" name="nombre" id="nombre" value={formData.nombre} onChange={handleChange}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
                <label htmlFor="profesor" className="block text-sm font-medium text-gray-200">Profesor</label>
                <select name="profesor" id="profesor" value={formData.profesor} onChange={handleChange}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="">Selecciona un profesor</option>
                    {teachers.filter(t => t.activo !== false).map(teacher => (
                        <option key={teacher._id || teacher.id} value={teacher._id || teacher.id}>{teacher.nombre} {teacher.apellido}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="dia" className="block text-sm font-medium text-gray-200">Día de la Semana</label>
                <select name="dia" id="dia" value={formData.dia} onChange={handleChange}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500">
                    {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(day => (
                        <option key={day} value={day}>{day}</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-200">Hora Inicio (HH:MM)</label>
                    <input type="time" name="horaInicio" id="horaInicio" value={formData.horaInicio} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
                </div>
                <div>
                    <label htmlFor="horaFin" className="block text-sm font-medium text-gray-200">Hora Fin (HH:MM)</label>
                    <input type="time" name="horaFin" id="horaFin" value={formData.horaFin} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
                </div>
            </div>
            <div>
                <label htmlFor="capacidad" className="block text-sm font-medium text-gray-200">Capacidad Máxima</label>
                <input type="number" name="capacidad" id="capacidad" value={formData.capacidad} onChange={handleChange} min="1"
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
            <div className="flex gap-4 mt-6">
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow">Guardar Cambios</button>
                <button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md shadow">Cancelar</button>
            </div>
        </form>
    );
};

export default ClassEditForm;
