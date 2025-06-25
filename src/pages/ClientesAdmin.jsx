import { useState, useEffect } from "react";
import {
  UserPlusIcon,
  QrCodeIcon,
  UsersIcon,
  UserMinusIcon,
  Cog6ToothIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { showSuccess, showError, confirmAction } from "../utils/alerts";

// Simulación de LocalStorage para clientes
const getClientsFromLocalStorage = () => {
  const clients = localStorage.getItem("clients");
  return clients ? JSON.parse(clients) : [];
};

const saveClientsToLocalStorage = (clients) => {
  localStorage.setItem("clients", JSON.stringify(clients));
};

const ClientsAdmin = () => {
  const [view, setView] = useState("menu"); // 'menu', 'add', 'list'
  const [clients, setClients] = useState(getClientsFromLocalStorage());
  const [formData, setFormData] = useState({ name: "", email: "", plan: "basic" });

  useEffect(() => {
    saveClientsToLocalStorage(clients);
  }, [clients]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitClient = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showError("Error de Validación", "Nombre y Email son campos obligatorios.");
      return;
    }
    // Simulación de creación de ID único
    const newClient = { id: Date.now().toString(), ...formData };
    setClients((prevClients) => [...prevClients, newClient]);
    showSuccess("Cliente Agregado", `${formData.name} ha sido agregado exitosamente.`);
    setFormData({ name: "", email: "", plan: "basic" }); // Reset form
    setView("list"); // Volver a la lista después de agregar
  };

  const handleDeleteClient = (clientId, clientName) => {
    confirmAction(
      `¿Eliminar Cliente?`,
      `Estás a punto de eliminar a ${clientName}. Esta acción es irreversible.`,
      "Sí, eliminar",
      () => {
        setClients((prevClients) => prevClients.filter((client) => client.id !== clientId));
        showSuccess("Cliente Eliminado", `${clientName} ha sido eliminado.`);
      }
    );
  };

  const menuOptions = [
    {
      icon: <UserPlusIcon className="w-8 h-8 text-white" />,
      label: "Alta de cliente",
      action: () => setView("add"),
    },
    {
      icon: <UsersIcon className="w-8 h-8 text-white" />,
      label: "Lista de clientes",
      action: () => setView("list"),
    },
    {
      icon: <QrCodeIcon className="w-8 h-8 text-white" />,
      label: "Generar QR",
      action: () => showError("Función no implementada", "La generación de QR aún no está disponible."),
    },
    {
      icon: <UserMinusIcon className="w-8 h-8 text-white" />,
      label: "Baja de cliente (ver lista)",
      action: () => setView("list"),
    },
    {
      icon: <Cog6ToothIcon className="w-8 h-8 text-white" />,
      label: "Configuración",
      action: () => showError("Función no implementada", "La configuración aún no está disponible."),
    },
  ];

  if (view === "add") {
    return (
      <div>
        <button onClick={() => setView("menu")} className="mb-4 text-orange-400 hover:text-orange-500">
          &larr; Volver al menú
        </button>
        <h2 className="text-2xl font-bold text-orange-400 mb-6">Alta de Nuevo Cliente</h2>
        <form onSubmit={handleSubmitClient} className="space-y-4 max-w-lg bg-gray-800 p-6 rounded-lg">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-200">Nombre Completo</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label htmlFor="plan" className="block text-sm font-medium text-gray-200">Plan</label>
            <select
              name="plan"
              id="plan"
              value={formData.plan}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="basic">Básico</option>
              <option value="premium">Premium</option>
              <option value="gold">Gold</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md shadow"
          >
            Guardar Cliente
          </button>
        </form>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div>
        <button onClick={() => setView("menu")} className="mb-4 text-orange-400 hover:text-orange-500">
          &larr; Volver al menú
        </button>
        <h2 className="text-2xl font-bold text-orange-400 mb-6">Lista de Clientes</h2>
        {clients.length === 0 ? (
          <p className="text-gray-400">No hay clientes registrados.</p>
        ) : (
          <ul className="space-y-3">
            {clients.map((client) => (
              <li key={client.id} className="bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold text-white">{client.name}</p>
                  <p className="text-sm text-gray-300">{client.email} - Plan: {client.plan}</p>
                </div>
                <button
                  onClick={() => handleDeleteClient(client.id, client.name)}
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar Cliente"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
         <button
          onClick={() => setView("add")}
          className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md shadow flex items-center gap-2"
        >
          <UserPlusIcon className="w-5 h-5" />
          Agregar Nuevo Cliente
        </button>
      </div>
    );
  }

  // Default view: Menu
  return (
    <div>
      <h2 className="text-3xl font-bold text-orange-400 mb-6">Gestión de Clientes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {menuOptions.map((opt, index) => (
          <div
            key={index}
            onClick={opt.action}
            className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg shadow flex flex-col items-center justify-center gap-2 cursor-pointer transition duration-200 h-32"
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
