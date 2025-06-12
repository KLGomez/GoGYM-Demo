import { Link } from "react-router-dom";
import {
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const SidebarAdmin = () => {
  const menuItems = [
    {
      label: "Artículos",
      icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
      path: "/articles",
    },
    {
      label: "Clases",
      icon: <CalendarDaysIcon className="w-5 h-5" />,
      path: "/classes",
    },
    {
      label: "Membresías",
      icon: <CreditCardIcon className="w-5 h-5" />,
      path: "/memberships",
    },
    {
      label: "Clientes",
      icon: <UsersIcon className="w-5 h-5" />,
      path: "/clients",
    },
  ];

  return (
    <aside className="bg-gray-800 text-white w-64 h-screen p-6 flex flex-col shadow-lg">
      <h1 className="text-3xl font-extrabold text-orange-400 mb-10 text-center">GOGYM</h1>
      <nav className="flex flex-col gap-4">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="flex items-center gap-3 text-orange-300 hover:text-white hover:bg-orange-500 px-3 py-2 rounded transition duration-200"
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default SidebarAdmin;
