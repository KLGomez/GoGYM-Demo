import React, { useState, useEffect } from "react";
import {
  UserPlusIcon,
  QrCodeIcon as MenuQrCodeIcon,
  UsersIcon,
  UserMinusIcon,
  Cog6ToothIcon,
  TrashIcon,
  XMarkIcon,
  PencilIcon, // Icono para editar
} from "@heroicons/react/24/outline";
import { QRCodeCanvas } from 'qrcode.react';
import { showSuccess, showError, confirmAction } from "../utils/alerts";

const getClientsFromLocalStorage = () => {
  const clients = localStorage.getItem("clients");
  return clients ? JSON.parse(clients) : [];
};

const saveClientsToLocalStorage = (clients) => {
  localStorage.setItem("clients", JSON.stringify(clients));
};

const calculateMembershipDetails = (startDate, durationDays) => {
  const start = new Date(startDate);
  const endDate = new Date(start);
  endDate.setDate(start.getDate() + durationDays);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfDayEndDate = new Date(endDate);
  endOfDayEndDate.setHours(23, 59, 59, 999);

  const timeDiff = endOfDayEndDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return {
    membershipEndDate: endDate.toISOString(),
    daysRemaining: daysRemaining < 0 ? 0 : daysRemaining,
    status: daysRemaining > 0 ? "Active" : "Expired",
  };
};


const ClientsAdmin = () => {
  const [view, setView] = useState("menu");
  const [clients, setClients] = useState(getClientsFromLocalStorage());
  const [editingClient, setEditingClient] = useState(null); // Para manejar el cliente en edición
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

  const resetFormAndState = () => {
    setFormData({ name: "", email: "", plan: "basic", membershipDurationDays: 30 });
    setEditingClient(null);
    setView("list"); // Volver a la lista por defecto después de guardar o si se cancela la edición
  };

  const handleSubmitClient = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showError("Error de Validación", "Nombre y Email son campos obligatorios.");
      return;
    }
    // Validación de email (simple)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        showError('Email Inválido', 'Por favor, ingrese un email válido.');
        return;
    }
    if (isNaN(formData.membershipDurationDays) || formData.membershipDurationDays <= 0) {
        showError('Duración Inválida', 'La duración de la membresía debe ser un número mayor a cero.');
        return;
    }


    if (editingClient) {
      // Actualizar cliente existente
      // No se actualiza membershipStartDate al editar, solo se permite cambiar la duración o datos personales.
      // Si se quisiera permitir cambiar la fecha de inicio, se necesitaría un campo adicional en el form.
      setClients(clients.map(client =>
        client.id === editingClient.id
        ? { ...client, ...formData, membershipDurationDays: Number(formData.membershipDurationDays) } // Asegurar que duration sea número
        : client
      ));
      showSuccess("Cliente Actualizado", `${formData.name} ha sido actualizado.`);
    } else {
      // Crear nuevo cliente
      const membershipStartDate = new Date().toISOString();
      const newClient = {
        id: Date.now().toString(),
        ...formData,
        membershipStartDate,
        membershipDurationDays: Number(formData.membershipDurationDays) // Asegurar que duration sea número
      };
      setClients((prevClients) => [...prevClients, newClient]);
      showSuccess("Cliente Agregado", `${formData.name} ha sido agregado exitosamente.`);
    }
    resetFormAndState();
  };

  const handleEditClient = (clientToEdit) => {
    setEditingClient(clientToEdit);
    setFormData({
      name: clientToEdit.name,
      email: clientToEdit.email,
      plan: clientToEdit.plan,
      membershipDurationDays: clientToEdit.membershipDurationDays,
    });
    setView("add"); // Reutilizar la vista 'add' para el formulario de edición
  };


  const handleDeleteClient = (clientId, clientName) => {
    confirmAction(
      `¿Eliminar Cliente "${clientName}"?`,
      `Esta acción es irreversible.`,
      "Sí, eliminar",
      () => {
        setClients((prevClients) => prevClients.filter((client) => client.id !== clientId));
        showSuccess("Cliente Eliminado", `${clientName} ha sido eliminado.`);
        if (editingClient && editingClient.id === clientId) { // Si se elimina el cliente que se está editando
          resetFormAndState();
        }
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
      action: () => { setEditingClient(null); setFormData({ name: "", email: "", plan: "basic", membershipDurationDays: 30 }); setView("add"); }
    },
    {
      icon: <UsersIcon className="w-8 h-8 text-white" />,
      label: "Lista de clientes",
      action: () => setView("list"),
    },
    {
      icon: <MenuQrCodeIcon className="w-8 h-8 text-white" />,
      label: "Generar QR (desde lista)",
      action: () => { /* ... (sin cambios) ... */ }
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

  // Renderizado del Formulario (Alta o Edición)
  if (view === "add") {
    return (
      <div>
        <button onClick={() => { setEditingClient(null); setView("list"); }} className="mb-4 text-orange-400 hover:text-orange-500">
          {editingClient ? <> &larr; Volver a la lista</> : <> &larr; Volver al menú</>}
        </button>
        <h2 className="text-2xl font-bold text-orange-400 mb-6">
          {editingClient ? "Editar Cliente" : "Alta de Nuevo Cliente"}
        </h2>
        <form onSubmit={handleSubmitClient} className="space-y-4 max-w-lg bg-gray-800 p-6 rounded-lg">
          {/* Campos del formulario (name, email, plan, membershipDurationDays) sin cambios visuales,
              pero ahora controlados por formData que se actualiza en handleEditClient */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-200">Nombre Completo</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange}
                   className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"/>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">Email</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange}
                   className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"/>
          </div>
          <div>
            <label htmlFor="plan" className="block text-sm font-medium text-gray-200">Plan</label>
            <select name="plan" id="plan" value={formData.plan} onChange={handleInputChange}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500">
              <option value="basic">Básico</option>
              <option value="premium">Premium</option>
              <option value="gold">Gold</option>
            </select>
          </div>
          <div>
            <label htmlFor="membershipDurationDays" className="block text-sm font-medium text-gray-200">Duración Membresía (días)</label>
            <input type="number" name="membershipDurationDays" id="membershipDurationDays" value={formData.membershipDurationDays} onChange={handleInputChange} min="1"
                   className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"/>
          </div>
          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md shadow">
            {editingClient ? "Actualizar Cliente" : "Guardar Cliente"}
          </button>
          {editingClient && (
            <button type="button" onClick={resetFormAndState}
                    className="mt-2 w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md shadow">
              Cancelar Edición
            </button>
          )}
        </form>
      </div>
    );
  }

  // Renderizado de la Lista de Clientes
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
                  <div className="flex justify-between items-start"> {/* Cambiado a items-start para alinear botones arriba */}
                    <div className="flex-grow"> {/* Para que el contenido de texto ocupe el espacio */}
                      <p className="font-semibold text-white">{client.name}</p>
                      <p className="text-sm text-gray-300">{client.email} - Plan: {client.plan}</p>
                      <p className={`text-sm ${status === "Active" ? 'text-green-400' : 'text-red-400'}`}>
                        Estado: {status} ({daysRemaining} días restantes)
                      </p>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0"> {/* Evita que los botones se envuelvan */}
                       <button
                        onClick={() => handleEditClient(client)}
                        className="text-blue-400 hover:text-blue-600 p-1"
                        title="Editar Cliente"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleShowQR(client)}
                        className="text-teal-400 hover:text-teal-600 p-1" // Color cambiado para diferenciar
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
          onClick={() => { setEditingClient(null); setFormData({ name: "", email: "", plan: "basic", membershipDurationDays: 30 }); setView("add"); }}
          className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md shadow flex items-center gap-2"
        >
          <UserPlusIcon className="w-5 h-5" />
          Agregar Nuevo Cliente
        </button>
      </div>
    );
  }

   // Renderizado del Modal QR (sin cambios)
  if (view === "qr" && selectedClientForQR) {
    const { membershipEndDate, daysRemaining, status } = calculateMembershipDetails(
      selectedClientForQR.membershipStartDate,
      selectedClientForQR.membershipDurationDays
    );
    const qrData = JSON.stringify({ /* ... */ });
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          {/* ... (contenido del modal QR sin cambios) ... */}
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


  // Default view: Menu (sin cambios)
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
