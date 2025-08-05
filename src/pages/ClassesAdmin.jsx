import { useState } from "react";
import {
  CalendarDaysIcon,
  PlusCircleIcon,
  UserGroupIcon, // Icono para Asistencia y ahora para Alumnos (Inscripciones)
  AcademicCapIcon,
  // IdentificationIcon, // Reemplazado por UserGroupIcon para Alumnos
  ClockIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import ManageClassesView from "./ManageClassesView";
import ScheduleView from "./ScheduleView";
import ManageTeachersView from "./ManageTeachersView";
import AttendanceView from "./AttendanceView";
import EnrollStudentsView from "./EnrollStudentsView"; // Importar EnrollStudentsView
import CardMenuOption from "../components/CardMenuOption";

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
    {
      icon: <CalendarDaysIcon className="w-8 h-8 text-white" />,
      label: "Cronograma de Clases",
      viewName: "schedule",
      description: "Visualizá el calendario de clases programadas.",
    },
    {
      icon: <PlusCircleIcon className="w-8 h-8 text-white" />,
      label: "Gestionar Clases",
      viewName: "manageClasses",
      description: "Creá, editá y organizá las clases disponibles.",
    },
    {
      icon: <AcademicCapIcon className="w-8 h-8 text-white" />,
      label: "Gestionar Profesores",
      viewName: "teachers",
      description: "Asigná y editá perfiles de los instructores.",
    },
/*     {
      icon: <UserGroupIcon className="w-8 h-8 text-white" />,
      label: "Inscribir Alumnos",
      viewName: "students",
      description: "Agregá alumnos a las clases activas.",
    },
    {
      icon: <UserGroupIcon className="w-8 h-8 text-white" />,
      label: "Registrar Asistencia",
      viewName: "attendance",
      description: "Llevá el control de asistencia en cada clase.",
    },
    {
      icon: <ClockIcon className="w-8 h-8 text-white" />,
      label: "Historial de Clases",
      viewName: "history",
      description: "Consultá las clases pasadas y sus registros.",
    }, */
  ];


  const handleMenuClick = (viewName) => {
    setCurrentView(viewName);
  };

  const navigateToMenu = () => setCurrentView("menu");

  if (currentView === "menu") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {menuOptions.map((opt, index) => (
          <CardMenuOption
            key={index}
            icon={opt.icon}
            label={opt.label}
            description={opt.description || "Accedé a esta funcionalidad para más detalles."}
            onClick={() => handleMenuClick(opt.viewName)}

          />
        ))}
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

  if (currentView === "teachers") {
    return <ManageTeachersView onBack={navigateToMenu} />;
  }

  if (currentView === "attendance") {
    return <AttendanceView onBack={navigateToMenu} />;
  }

  if (currentView === "students") {
    return <EnrollStudentsView onBack={navigateToMenu} />;
  }

  // Para otras vistas, seguimos usando PlaceholderView
  const selectedOption = menuOptions.find(opt => opt.viewName === currentView);
  const viewTitle = selectedOption ? selectedOption.label : "Subsección de Clases";

  return <PlaceholderView title={viewTitle} onBack={navigateToMenu} />;
};

export default ClassesAdmin;