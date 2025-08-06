import { NavLink } from "react-router-dom";
import {
  ClipboardDocumentListIcon,
  HomeIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  UsersIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";

const SidebarAdmin = () => {
  const menuItems = [
    { label: "Dashboard", icon: HomeIcon, path: "home-page" },
    { label: "Check-In QR", icon: QrCodeIcon, path: "check-in" },
    { label: "Clientes", icon: UsersIcon, path: "clients" },
    { label: "Clases", icon: CalendarDaysIcon, path: "classes" },
    { label: "Membresías", icon: CreditCardIcon, path: "memberships" },
    { label: "Artículos", icon: ClipboardDocumentListIcon, path: "articles" },
  ];

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-800 text-white p-6 shadow-lg min-h-screen">
        <h2 className="text-2xl font-bold text-orange-400 mb-6 text-left">GoGYM</h2>
        <nav className="flex flex-col gap-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded transition duration-200 ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : "text-orange-300 hover:text-white hover:bg-orange-500 transform hover:scale-110 cursor-pointer"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Bottom Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 text-white flex justify-around items-center py-2 shadow z-50">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center text-xs ${
                  isActive
                    ? "text-orange-400"
                    : "text-orange-300 hover:text-white"
                }`
              }
            >
              <Icon className="w-6 h-6 mb-1" />
              {item.label.split(" ")[0]}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default SidebarAdmin;
