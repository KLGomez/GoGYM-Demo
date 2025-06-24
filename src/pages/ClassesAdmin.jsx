import {
  CalendarDaysIcon,
  PlusCircleIcon,
  UserGroupIcon,
  AcademicCapIcon,
  IdentificationIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const ClassesAdmin = () => {
  const options = [
    { icon: <CalendarDaysIcon className="w-8 h-8 text-white" />, label: "Cronograma de Clase" },
    { icon: <PlusCircleIcon className="w-8 h-8 text-white" />, label: "Añadir/Eliminar Clase" },
    { icon: <UserGroupIcon className="w-8 h-8 text-white" />, label: "Asistencia" },
    { icon: <AcademicCapIcon className="w-8 h-8 text-white" />, label: "Profesores" },
    { icon: <IdentificationIcon className="w-8 h-8 text-white" />, label: "Alumnos" },
    { icon: <ClockIcon className="w-8 h-8 text-white" />, label: "Historial" },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-primary mb-6">Clases y horarios</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {options.map((opt, index) => (
          <div
            key={index}
            className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg shadow flex flex-col items-center justify-center gap-2 cursor-pointer transition"
          >
            {opt.icon}
            <span className="font-semibold text-center">{opt.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassesAdmin;
