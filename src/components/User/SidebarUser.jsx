// Contenido inicial para SidebarUser.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, RectangleStackIcon, UserGroupIcon, CreditCardIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'; // Ejemplo de iconos

const SidebarUser = () => {
  const navLinks = [
    { to: '/', text: 'Dashboard', icon: HomeIcon },
    { to: '/clases', text: 'Clases', icon: RectangleStackIcon },
    { to: '/mis-clases', text: 'Mis Clases', icon: UserGroupIcon },
    { to: '/mi-membresia', text: 'Membresía', icon: CreditCardIcon },
    { to: '/feedback', text: 'Feedback', icon: ChatBubbleLeftRightIcon },
  ];

  return (
    <>
      {/* Versión Desktop: Sidebar a la izquierda */}
      <aside className="hidden md:flex md:flex-col w-64 bg-gray-900 text-white">
        <div className="p-4 mb-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-orange-500 text-center">GoGym</h2>
        </div>
        <nav className="flex-1 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end // Important for accurate active state on index routes like '/'
              className={({ isActive }) =>
                `flex items-center py-2.5 px-4 rounded-md mx-2 transition-colors duration-150 ease-in-out ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <link.icon className="h-6 w-6 mr-3" />
              {link.text}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Versión Mobile: Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 text-white flex justify-around items-center p-2 border-t border-gray-700 shadow-lg">
        {navLinks.map((link) => (
          <NavLink
            key={link.to + "-mobile"}
            to={link.to}
            end // Important for accurate active state
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-1 rounded-md w-1/5 transition-colors duration-150 ease-in-out ${
                isActive ? 'text-orange-500' : 'text-gray-400 hover:text-orange-400'
              }`
            }
          >
            <link.icon className="h-6 w-6 mb-0.5" />
            <span className="text-xs font-medium">{link.text}</span>
          </NavLink>
        ))}
      </nav>
      {/* Placeholder for content to push above bottom nav on mobile */}
      <div className="md:hidden pb-16"></div>
    </>
  );
};

export default SidebarUser;
