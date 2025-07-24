import React, { useContext, useEffect } from 'react'; // Importar useContext y useEffect
import { Outlet, useNavigate } from 'react-router-dom'; // Importar useNavigate
import HeaderUser from './components/User/HeaderUser';
import SidebarUser from './components/User/SidebarUser';
import Footer from './components/Footer';
import { SharedDataContext } from './contexts/SharedDataContext'; // Importar el contexto
import { showSuccess, showError, confirmAction } from './utils/alerts'; // Para mostrar notificaciones del contexto

const UserLayout = () => {
  const { currentUser, notifications, markNotificationAsRead, isLoading } = useContext(SharedDataContext);
  const navigate = useNavigate();

  // Efecto para redirigir si no hay usuario o no está cargando
  useEffect(() => {
    if (!isLoading && !currentUser) {
      showError("Acceso Denegado", "Debes iniciar sesión para acceder a esta área.");
      navigate('/login');
    }
  }, [currentUser, isLoading, navigate]);

  // Efecto para mostrar notificaciones del contexto
  useEffect(() => {
    if (currentUser && notifications && notifications.length > 0) {
      const userNotifications = notifications.filter(
        n => !n.read && (n.forUserId === currentUser.id || (n.isGlobal && n.forUserId !== 'admin'))
      );
      userNotifications.forEach(n => {
        if (n.type === 'success') showSuccess("Notificación", n.message);
        else if (n.type === 'error') showError("Notificación", n.message);
        else if (n.type === 'warning') confirmAction("Atención", n.message, "Entendido", () => {}); // confirmAction para warnings
        else showSuccess("Info", n.message); // Default

        markNotificationAsRead(n.id);
      });
    }
  }, [notifications, currentUser, markNotificationAsRead]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white text-xl">Cargando...</div>;
  }

  if (!currentUser && !isLoading) {
    // Ya se redirige en el useEffect, pero esto es un fallback por si acaso.
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderUser /> {/* HeaderUser podría necesitar acceso al contexto para el nombre del usuario o logout */}
      <div className="flex flex-1">
        <SidebarUser /> {/* SidebarUser también podría necesitar el contexto */}
        <main className="flex-1 bg-black text-white p-6 pb-28 md:pb-6 overflow-y-auto">
          <Outlet /> {/* El contenido de la ruta hija se renderiza aquí */}
        </main>
      </div>
      <Footer />
    </div>
  );
};

// AppUser ahora simplemente renderiza UserLayout.
// UserLayout contiene la lógica de protección de ruta y manejo de notificaciones.
const AppUser = () => {
  return <UserLayout />;
};

export default AppUser;
