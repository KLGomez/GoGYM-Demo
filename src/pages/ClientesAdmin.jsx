import {
  UserPlusIcon,
  QrCodeIcon,
  UsersIcon,
  UserMinusIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const ClientsAdmin = () => {
  const options = [
    {
      icon: <QrCodeIcon className="w-8 h-8 text-white" />,
      label: "Generar QR",
    },
    {
      icon: <UsersIcon className="w-8 h-8 text-white" />,
      label: "Lista de clientes",
    },
    {
      icon: <UserPlusIcon className="w-8 h-8 text-white" />,
      label: "Alta de cliente",
    },
    {
      icon: <UserMinusIcon className="w-8 h-8 text-white" />,
      label: "Baja de cliente",
    },
    {
      icon: <Cog6ToothIcon className="w-8 h-8 text-white" />,
      label: "Configuración",
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-primary mb-6">Gestión de Clientes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {options.map((opt, index) => (
          <div
            key={index}
            className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg shadow flex flex-col items-center justify-center gap-2 cursor-pointer transition duration-200"
          >
            {opt.icon}
            <span className="font-semibold text-center">{opt.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientsAdmin;
