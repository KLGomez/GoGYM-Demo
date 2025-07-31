import React, { useContext, useEffect } from 'react'; // Importar useContext y useEffect
import { Outlet, useNavigate } from "react-router-dom"; // Importar useNavigate
import Sidebar from "./components/SidebarAdmin";
import Header from "./components/Header";
import FooterAdmin from "./components/Footer";
import { SharedDataContext } from './contexts/SharedDataContext'; // Importar el contexto
import { showSuccess, showError } from './utils/alerts'; // Para mostrar notificaciones del contexto

// Layout principal para el panel de Admin
const AdminLayout = () => {
  const { currentUser, notifications, markNotificationAsRead, isLoading } = useContext(SharedDataContext);
  const navigate = useNavigate();

  // Protección de ruta y rol
  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        showError("Acceso Denegado", "Debes iniciar sesión para acceder al panel de administración.");
        navigate('/login');
      } else if (currentUser.role !== 'admin') {
        //! Acá esta el error -> verificar 
        // Asumimos que el objeto currentUser tiene una propiedad 'role'
        // Si no la tiene, se debe adaptar la lógica de loginUser en el contexto para asignarla.
        // O inferirla aquí si es necesario, ej: currentUser.email === 'admin@gogym.com'
        showError("Acceso Denegado", "No tienes permisos para acceder a esta área.");
        navigate('/user'); // Redirigir al panel de usuario o a una página de error
      }
    }
  }, [currentUser, isLoading, navigate]);

  // Mostrar notificaciones para el admin (ej. de acciones realizadas)
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin' && notifications && notifications.length > 0) {
      const adminNotifications = notifications.filter(
        n => !n.read && (n.forUserId === 'admin' || n.isGlobal) // Admin ve las suyas y las globales
      );
      adminNotifications.forEach(n => {
        if (n.type === 'success') showSuccess("Admin Notificación", n.message);
        else if (n.type === 'error') showError("Admin Notificación", n.message);
        else if (n.type === 'warning') showError("Admin Advertencia", n.message); // Usar showError para warnings por ahora
        else showSuccess("Admin Info", n.message);

        markNotificationAsRead(n.id);
      });
    }
  }, [notifications, currentUser, markNotificationAsRead]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white text-xl">Cargando...</div>;
  }

  if (!currentUser || currentUser.role !== 'admin') {
    // Ya se redirige en el useEffect, esto es un fallback o para evitar renderizar el layout.
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Header /> {/* HeaderAdmin podría necesitar el contexto para logout o nombre */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar /> {/* Sidebar podría necesitar el contexto */}
        <main className="flex-1 bg-black text-white p-6 pb-28 md:pb-6 overflow-y-auto">
          <Outlet /> {/* Contenido de la ruta hija de admin */}
        </main>
      </div>
      <FooterAdmin />
    </div>
  );
}


// AppAdmin ahora simplemente renderiza AdminLayout.
// AdminLayout contiene la lógica de protección de ruta y manejo de notificaciones.
function AppAdmin() {
  return <AdminLayout />;
}

export default AppAdmin;
