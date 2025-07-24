import React, { useState } from "react"; // Importar useContext
import {
  CalendarDaysIcon,
  PlusCircleIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import ManageClassesView from "./ManageClassesView"; // Ya usa el contexto
import { showError } from "../utils/alerts"; // Para placeholders

// PlaceholderView no cambia, solo muestra un mensaje.
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
    <p className="text-sm text-yellow-500 mt-2">Esta sección aún no ha sido conectada al sistema de datos centralizado.</p>
  </div>
);


const ClassesAdmin = () => {
  const [currentView, setCurrentView] = useState("menu");
  // Opcional: consumir algo del contexto aquí si ClassesAdmin lo necesitara directamente.
  // const { currentUser } = useContext(SharedDataContext);

  const menuOptions = [
    { icon: <CalendarDaysIcon className="w-8 h-8 text-white" />, label: "Cronograma de Clases", viewName: "schedule" },
    { icon: <PlusCircleIcon className="w-8 h-8 text-white" />, label: "Gestionar Clases", viewName: "manageClasses" }, // Cambiado
    { icon: <AcademicCapIcon className="w-8 h-8 text-white" />, label: "Gestionar Profesores", viewName: "teachers" }, // Cambiado
    { icon: <UserGroupIcon className="w-8 h-8 text-white" />, label: "Inscribir Alumnos", viewName: "students" },
    { icon: <UserGroupIcon className="w-8 h-8 text-white" />, label: "Registrar Asistencia", viewName: "attendance" }, // Cambiado
    { icon: <ClockIcon className="w-8 h-8 text-white" />, label: "Historial de Clases", viewName: "history" }, // Cambiado
  ];

  const handleMenuClick = (viewName) => {
    // Para las vistas no refactorizadas aún, podemos mostrar un mensaje temporal.
    const nonRefactoredViews = ["schedule", "teachers", "students", "attendance", "history"];
    if (nonRefactoredViews.includes(viewName) && viewName !== "manageClasses") {
        showError("En Desarrollo", `La sección "${menuOptions.find(opt => opt.viewName === viewName)?.label}" está en desarrollo y aún no utiliza el nuevo sistema de datos.`);
        // Opcionalmente, podríamos no cambiar la vista:
        // return;
    }
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
  if (currentView === "manageClasses") { // Esta ya está refactorizada
    return <ManageClassesView onBack={navigateToMenu} />;
  }

  // Para las otras vistas, temporalmente usamos PlaceholderView o sus componentes originales
  // si queremos ver su UI actual (aunque no estén conectadas al contexto).
  // Por simplicidad y para indicar el trabajo pendiente, usaré PlaceholderView para las no refactorizadas.

  if (currentView === "schedule") {
    // return <ScheduleView onBack={navigateToMenu} />; // Si se quiere ver la UI vieja
    return <PlaceholderView title="Cronograma de Clase" onBack={navigateToMenu} />;
  }
  if (currentView === "teachers") {
    // return <ManageTeachersView onBack={navigateToMenu} />;
     return <PlaceholderView title="Gestionar Profesores" onBack={navigateToMenu} />;
  }
  if (currentView === "attendance") {
    // return <AttendanceView onBack={navigateToMenu} />;
    return <PlaceholderView title="Registrar Asistencia" onBack={navigateToMenu} />;
  }
  if (currentView === "students") {
    // return <EnrollStudentsView onBack={navigateToMenu} />;
    return <PlaceholderView title="Inscribir Alumnos" onBack={navigateToMenu} />;
  }
   if (currentView === "history") {
    return <PlaceholderView title="Historial de Clases" onBack={navigateToMenu} />;
  }

  // Fallback por si acaso
  const selectedOption = menuOptions.find(opt => opt.viewName === currentView);
  const viewTitle = selectedOption ? selectedOption.label : "Subsección de Clases";
  return <PlaceholderView title={viewTitle} onBack={navigateToMenu} />;
};

export default ClassesAdmin;
