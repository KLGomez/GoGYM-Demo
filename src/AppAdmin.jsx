import React, { useContext, useEffect } from 'react'; // Importar useContext y useEffect
import { Outlet, useNavigate } from "react-router-dom"; // Importar useNavigate
import Sidebar from "./components/SidebarAdmin";
import Header from "./components/Header";
import FooterAdmin from "./components/Footer";
import { SharedDataContext } from './contexts/SharedDataContext'; // Importar el contexto
import { showSuccess, showError, showWarning } from './utils/alerts'; // Para mostrar notificaciones del contexto

// Layout principal para el panel de Admin
const AdminLayout = () => {
  const { currentUser, notifications, markNotificationAsRead, isLoading, isLoggingOut } = useContext(SharedDataContext);
  const navigate = useNavigate();

  // Protección de ruta y rol
  useEffect(() => {
    if (!isLoading && !isLoggingOut) {
      if (!currentUser) {
        showError("Acceso Denegado", "Debes iniciar sesión para acceder al panel de administración.");
        navigate('/login');
      } else if (currentUser.rol !== 'administrador' && currentUser.rol !== 'admin') {
        showError("Acceso Denegado", "No tienes permisos para acceder a esta área.");
        navigate('/user');
      }
    }
  }, [currentUser, isLoading, isLoggingOut, navigate]);


  // Mostrar notificaciones para el admin (ej. de acciones realizadas)
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin' && notifications && notifications.length > 0) {
      const adminNotifications = notifications.filter(
        n => !n.read && (n.forUserId === 'admin' || n.isGlobal) // Admin ve las suyas y las globales
      );
      adminNotifications.forEach(n => {
        if (n.type === 'success') showSuccess(n.actionType || 'notification', n.data || { title: n.title, text: n.message });
        else if (n.type === 'error') showError(n.actionType || 'notification', n.data || { title: n.title, text: n.message });
        else if (n.type === 'warning') showWarning(n.actionType || 'warning', n.data || { title: n.title, text: n.message });

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
