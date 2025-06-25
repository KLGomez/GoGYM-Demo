import { useState, useEffect } from "react";
import {
  UserPlusIcon,
  QrCodeIcon as MenuQrCodeIcon, // Renamed to avoid conflict
  UsersIcon,
  UserMinusIcon,
  Cog6ToothIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { QRCodeCanvas } from 'qrcode.react';
import { showSuccess, showError, confirmAction } from "../utils/alerts";

// Simulación de LocalStorage para clientes
const getClientsFromLocalStorage = () => {
  const clients = localStorage.getItem("clients");
  return clients ? JSON.parse(clients) : [];
};

const saveClientsToLocalStorage = (clients) => {
  localStorage.setItem("clients", JSON.stringify(clients));
};

// Helper para calcular fechas y días restantes
const calculateMembershipDetails = (startDate, durationDays) => {
  const start = new Date(startDate);
  const endDate = new Date(start);
  endDate.setDate(start.getDate() + durationDays);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar para comparación de solo fecha

  // Ajustar endDate para que sea el final del día para el cálculo de días restantes
  const endOfDayEndDate = new Date(endDate);
  endOfDayEndDate.setHours(23, 59, 59, 999);


  const timeDiff = endOfDayEndDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return {
    membershipEndDate: endDate.toISOString(),
    daysRemaining: daysRemaining < 0 ? 0 : daysRemaining, // No mostrar días negativos
    status: daysRemaining > 0 ? "Active" : "Expired",
  };
};


const ClientsAdmin = () => {
  const [view, setView] = useState("menu"); // 'menu', 'add', 'list', 'qr'
  const [clients, setClients] = useState(getClientsFromLocalStorage());
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    plan: "basic",
    membershipDurationDays: 30
  });
  const [selectedClientForQR, setSelectedClientForQR] = useState(null);

  useEffect(() => {
    saveClientsToLocalStorage(clients);
  }, [clients]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) : value }));
  };

  const handleSubmitClient = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showError("Error de Validación", "Nombre y Email son campos obligatorios.");
      return;
    }
    const membershipStartDate = new Date().toISOString();
    const newClient = {
      id: Date.now().toString(),
      ...formData,
      membershipStartDate,
    };
    setClients((prevClients) => [...prevClients, newClient]);
    showSuccess("Cliente Agregado", `${formData.name} ha sido agregado exitosamente.`);
    setFormData({ name: "", email: "", plan: "basic", membershipDurationDays: 30 });
    setView("list");
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

  const handleShowQR = (client) => {
    setSelectedClientForQR(client);
    setView("qr");
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
      icon: <MenuQrCodeIcon className="w-8 h-8 text-white" />,
      label: "Generar QR (desde lista)",
      action: () => {
        if (clients.length > 0) {
          setView("list"); // Ir a la lista para seleccionar cliente
          showSuccess("Seleccione un Cliente", "Elija un cliente de la lista para generar su QR.");
        } else {
          showError("No hay Clientes", "Agregue un cliente primero para poder generar un QR.");
        }
      }
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
              type="text" name="name" id="name" value={formData.name} onChange={handleInputChange}
              className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">Email</label>
            <input
              type="email" name="email" id="email" value={formData.email} onChange={handleInputChange}
              className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label htmlFor="plan" className="block text-sm font-medium text-gray-200">Plan</label>
            <select
              name="plan" id="plan" value={formData.plan} onChange={handleInputChange}
              className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="basic">Básico</option>
              <option value="premium">Premium</option>
              <option value="gold">Gold</option>
            </select>
          </div>
          <div>
            <label htmlFor="membershipDurationDays" className="block text-sm font-medium text-gray-200">Duración Membresía (días)</label>
            <input
              type="number" name="membershipDurationDays" id="membershipDurationDays" value={formData.membershipDurationDays} onChange={handleInputChange}
              min="1"
              className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
            />
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
          <div className="space-y-3">
            {clients.map((client) => {
              const { daysRemaining, status } = calculateMembershipDetails(client.membershipStartDate, client.membershipDurationDays);
              return (
                <div key={client.id} className="bg-gray-800 p-4 rounded-lg shadow ">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">{client.name}</p>
                      <p className="text-sm text-gray-300">{client.email} - Plan: {client.plan}</p>
                      <p className={`text-sm ${status === "Active" ? 'text-green-400' : 'text-red-400'}`}>
                        Estado: {status} ({daysRemaining} días restantes)
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleShowQR(client)}
                        className="text-blue-400 hover:text-blue-600 p-1"
                        title="Generar QR"
                      >
                        <MenuQrCodeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id, client.name)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Eliminar Cliente"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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

  if (view === "qr" && selectedClientForQR) {
    const { membershipEndDate, daysRemaining, status } = calculateMembershipDetails(
      selectedClientForQR.membershipStartDate,
      selectedClientForQR.membershipDurationDays
    );
    const qrData = JSON.stringify({
      clientId: selectedClientForQR.id,
      name: selectedClientForQR.name,
      email: selectedClientForQR.email,
      plan: selectedClientForQR.plan,
      membershipEndDate: membershipEndDate,
      status: status,
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-orange-400">Código QR de Acceso</h3>
            <button onClick={() => {setSelectedClientForQR(null); setView('list');}} className="text-gray-400 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-4">
            <QRCodeCanvas value={qrData} size={200} bgColor="#1f2937" fgColor="#ffffff" level="H" />
            <div className="text-center text-gray-200">
              <p className="font-semibold text-lg">{selectedClientForQR.name}</p>
              <p>{selectedClientForQR.email}</p>
              <p>Plan: {selectedClientForQR.plan}</p>
              <p>Vence: {new Date(membershipEndDate).toLocaleDateString()}</p>
              <p className={status === "Active" ? "text-green-400" : "text-red-400"}>
                Estado: {status} ({daysRemaining} días restantes)
              </p>
            </div>
          </div>
        </div>
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
