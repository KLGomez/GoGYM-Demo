import { Link, useLocation } from "react-router-dom";
import {
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  UsersIcon,
  QrCodeIcon, // Para el Check-in
} from "@heroicons/react/24/outline";

const SidebarAdmin = () => {
  const location = useLocation();

  const menuItems = [
    {
      label: "Check-In QR", // Nueva opción
      icon: QrCodeIcon,
      path: "check-in", // Relativo: se resolverá a /admin/check-in
    },
    {
      label: "Clientes",
      icon: UsersIcon,
      path: "clients", // Relativo: se resolverá a /admin/clients
    },
    {
      label: "Clases",
      icon: CalendarDaysIcon,
      path: "classes", // Relativo: se resolverá a /admin/classes
    },
    {
      label: "Membresías",
      icon: CreditCardIcon,
      path: "memberships", // Relativo: se resolverá a /admin/memberships
    },
    {
      label: "Artículos",
      icon: ClipboardDocumentListIcon,
      path: "articles", // Relativo: se resolverá a /admin/articles
    },
  ];

  return (
    <>
      {/* Sidebar visible solo en md+ */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-800 text-white p-6 shadow-lg min-h-screen">
        <h2 className="text-2xl font-bold text-orange-400 mb-6 text-left">GoGYM</h2>
        <nav className="flex flex-col gap-4">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded transition duration-200 ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-orange-300 hover:text-white hover:bg-orange-500 cursor-pointer transition-transform transform hover:scale-110"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Bottom nav para mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 text-white flex justify-around items-center py-2 shadow z-50">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex flex-col items-center text-xs ${
                isActive
                  ? "text-orange-400"
                  : "text-orange-300 hover:text-white"
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              {item.label.split(" ")[0]} {/* Ej: "Artículos", "Clases"... */}
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default SidebarAdmin;
