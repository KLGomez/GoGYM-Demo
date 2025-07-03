import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  RectangleStackIcon,
  UserGroupIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

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
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-800 text-white p-6 shadow-lg min-h-screen">
        <h2 className="text-2xl font-bold text-orange-400 mb-6 text-center">GoGYM</h2>
        <nav className="flex flex-col gap-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded transition duration-200 ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-orange-300 hover:text-white hover:bg-orange-500 transform hover:scale-105 cursor-pointer'
                }`
              }
            >
              <link.icon className="h-5 w-5" />
              <span className="font-medium">{link.text}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Bottom Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 text-white flex justify-around items-center py-2 shadow z-50">
        {navLinks.map((link) => (
          <NavLink
            key={link.to + '-mobile'}
            to={link.to}
            end
            className={({ isActive }) =>
              `flex flex-col items-center text-xs ${
                isActive ? 'text-orange-400' : 'text-orange-300 hover:text-white'
              }`
            }
          >
            <link.icon className="w-6 h-6 mb-1" />
            {link.text.split(' ')[0]}
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default SidebarUser;
