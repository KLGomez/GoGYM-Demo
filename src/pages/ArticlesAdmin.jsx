import { ShoppingCartIcon, ClipboardDocumentListIcon, BanknotesIcon, ChartBarIcon } from "@heroicons/react/24/outline";

const ArticlesAdmin = () => {
  const options = [
    { icon: <ShoppingCartIcon className="w-8 h-8" />, label: "Añadir Productos" },
    { icon: <ClipboardDocumentListIcon className="w-8 h-8" />, label: "Productos en Stock" },
    { icon: <BanknotesIcon className="w-8 h-8" />, label: "Lista de Precio" },
    { icon: <ChartBarIcon className="w-8 h-8" />, label: "Balance de Ventas" },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-primary mb-6">Gestionar artículos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {options.map((opt, index) => (
          <div
            key={index}
            className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg shadow flex flex-col items-center justify-center gap-2 cursor-pointer"
          >
            {opt.icon}
            <span className="font-semibold">{opt.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticlesAdmin;
