import { useState } from "react";
import {
  CalendarDaysIcon,
  PlusCircleIcon,
  UserGroupIcon,
  AcademicCapIcon,
  IdentificationIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import ManageClassesView from "./ManageClassesView";
import ScheduleView from "./ScheduleView"; // Importar ScheduleView

// Placeholder para las futuras vistas de subsección
const PlaceholderView = ({ title, onBack }) => (
  <div>
    <button
      onClick={onBack}
      className="mb-4 text-orange-400 hover:text-orange-500 flex items-center"
    >
      <ArrowLeftIcon className="w-5 h-5 mr-2" />
      Volver al menú de Clases
    </button>
    <h2 className="text-2xl font-bold text-orange-400 mb-6">{title}</h2>
    <p className="text-gray-300">Contenido de la sección "{title}" próximamente...</p>
  </div>
);


const ClassesAdmin = () => {
  const [currentView, setCurrentView] = useState("menu");

  const menuOptions = [
    { icon: <CalendarDaysIcon className="w-8 h-8 text-white" />, label: "Cronograma de Clase", viewName: "schedule" },
    { icon: <PlusCircleIcon className="w-8 h-8 text-white" />, label: "Añadir/Eliminar Clase", viewName: "manageClasses" },
    { icon: <UserGroupIcon className="w-8 h-8 text-white" />, label: "Asistencia", viewName: "attendance" },
    { icon: <AcademicCapIcon className="w-8 h-8 text-white" />, label: "Profesores", viewName: "teachers" },
    { icon: <IdentificationIcon className="w-8 h-8 text-white" />, label: "Alumnos", viewName: "students" },
    { icon: <ClockIcon className="w-8 h-8 text-white" />, label: "Historial", viewName: "history" },
  ];

  const handleMenuClick = (viewName) => {
    setCurrentView(viewName);
  };

  const navigateToMenu = () => setCurrentView("menu");

  if (currentView === "menu") {
    return (
      <div>
        <h2 className="text-3xl font-bold text-orange-400 mb-6">Gestión de Clases y Horarios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {menuOptions.map((opt, index) => (
            <div
              key={index}
              onClick={() => handleMenuClick(opt.viewName)}
              className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg shadow flex flex-col items-center justify-center gap-2 cursor-pointer transition h-32"
            >
              {opt.icon}
              <span className="font-semibold text-center">{opt.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Renderizar la vista de subsección seleccionada
  if (currentView === "manageClasses") {
    return <ManageClassesView onBack={navigateToMenu} />;
  }

  if (currentView === "schedule") {
    return <ScheduleView onBack={navigateToMenu} />;
  }

  // Para otras vistas, seguimos usando PlaceholderView
  const selectedOption = menuOptions.find(opt => opt.viewName === currentView);
  const viewTitle = selectedOption ? selectedOption.label : "Subsección de Clases";

  return <PlaceholderView title={viewTitle} onBack={navigateToMenu} />;
};

export default ClassesAdmin;
