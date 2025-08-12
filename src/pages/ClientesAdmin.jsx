// src/pages/ClientsAdmin.jsx

import React, { useState, useContext } from "react";
import { SharedDataContext } from "../contexts/SharedDataContext";
import CardMenuOption from "../components/CardMenuOption";
import ClientCreateForm from "../components/ClientCreateForm";
import ClientEditForm from "../components/ClientEditForm";
import CameraUploader from "../components/CameraUploader";
import { calculateMembershipDetails } from "../utils/membershipUtils";
import { confirmAction } from "../utils/alerts";

import {
  UserPlusIcon,
  QrCodeIcon as MenuQrCodeIcon,
  UsersIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { QRCodeCanvas } from "qrcode.react";

const ClientsAdmin = () => {
  const {
    clients: contextClients,
    addClient: contextAddClient,
    updateClient: contextUpdateClient,
    deleteClient: contextDeleteClient,
    isLoading,
  membershipPlans: contextMembershipPlans = [],
    // ...existing code...
  } = useContext(SharedDataContext);

  const [view, setView] = useState("menu");
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClientForQR, setSelectedClientForQR] = useState(null);

  const handleEditClient = (clientToEdit) => {
    setEditingClient(clientToEdit);
    setView("edit");
  };

  const handleDeleteClient = (clientId, clientFirstName, clientLastName) => {
    const fullName = `${clientFirstName || ""} ${clientLastName || ""}`.trim();
    confirmAction(
      `¿Eliminar Cliente "${fullName}"?`,
      `Esta acción es irreversible.`,
      "Sí, eliminar",
      () => {
        contextDeleteClient(clientId);
        if (editingClient && editingClient.id === clientId) {
          setEditingClient(null);
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
      description: "Registrar un nuevo cliente con sus datos personales y plan.",
      action: () => {
        setEditingClient(null);
        setView("create");
      },
    },
    {
      icon: <UsersIcon className="w-8 h-8 text-white" />,
      label: "Lista de clientes",
      description: "Visualizar, editar o eliminar los clientes registrados.",
      action: () => setView("list"),
    },
  ];

  if (view === "create") {
    return (
      <ClientCreateForm
        onCancel={() => setView("menu")}
        onSave={() => setView("list")}
        CameraUploader={CameraUploader}
        membershipPlans={contextMembershipPlans}
      />
    );
  }

  if (view === "edit") {
    return (
      <ClientEditForm
        initialClient={editingClient}
        onCancel={() => setView("list")}
        onSave={() => setView("list")}
        CameraUploader={CameraUploader}
        membershipPlans={contextMembershipPlans}
      />
    );
  }

  if (view === "list") {
    return (
      <div>
        <button onClick={() => setView("menu")} className="mb-4 text-orange-400 hover:text-orange-500">
          &larr; Volver al menú
        </button>
        <h2 className="text-2xl font-bold text-orange-400 mb-6">Lista de Clientes</h2>
        {isLoading && <p className="text-gray-400">Cargando clientes...</p>}
        {!isLoading && contextClients.length === 0 ? (
          <p className="text-gray-400">No hay clientes registrados.</p>
        ) : (
          <div className="space-y-3">
            {contextClients.map((client) => {
              // Adaptar nombre
              const clientName = `${client.nombre || ""} ${client.apellido || ""}`.trim();
              // Adaptar membresía
              let planName = "N/A";
              let membershipStartDate = client.fechaInicioMembresia;
              let membershipEndDate = client.fechaFinMembresia;
              let membershipDurationDays = null;
              // Buscar nombre del plan por id
              const planObj = contextMembershipPlans.find(p => (p.id || p._id) === client.planAsignadoId);
              if (planObj) {
                planName = planObj.nombre || planObj.name || planObj.planName;
                if (membershipStartDate && membershipEndDate) {
                  // Calcular duración en días
                  const start = new Date(membershipStartDate);
                  const end = new Date(membershipEndDate);
                  membershipDurationDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
                }
              }
              // Calcular estado de membresía
              const { daysRemaining, status } = calculateMembershipDetails(
                membershipStartDate,
                membershipDurationDays
              );
              const clientId = client._id || client.id;
              return (
                <div key={clientId} className="bg-gray-800 p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <p className="font-semibold text-white">{clientName}</p>
                      <p className="text-sm text-gray-300">Email: {client.email}</p>
                      <p className="text-sm text-gray-300">DNI: {client.dni}</p>
                      <p className="text-sm text-gray-300">Plan: {planName}</p>
                      <p className={`text-sm ${status === "Active" ? "text-green-400" : "text-red-400"}`}>
                        Estado Membresía: {status} ({daysRemaining} días restantes)
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditClient(client)} title="Editar Cliente" className="text-blue-400 hover:text-blue-600">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleShowQR(client)} title="QR" className="text-teal-400 hover:text-teal-600">
                        <MenuQrCodeIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteClient(clientId, client.nombre, client.apellido)} title="Eliminar" className="text-red-500 hover:text-red-700">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (view === "qr" && selectedClientForQR) {
    const clientName = `${selectedClientForQR.firstName || ""} ${selectedClientForQR.lastName || ""}`.trim();
    const membership = selectedClientForQR.membership || {};
    const { membershipEndDate, daysRemaining, status } = calculateMembershipDetails(
      membership.membershipStartDate,
      membership.membershipDurationDays
    );

    const qrData = JSON.stringify({
      clientId: selectedClientForQR.id,
      name: clientName,
      email: selectedClientForQR.email,
      plan: membership.planName,
      membershipEndDate,
      status,
      alphanumericCode: selectedClientForQR.alphanumericCode,
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-orange-400">Código QR</h3>
            <button onClick={() => { setSelectedClientForQR(null); setView("list"); }} className="text-gray-400 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-4">
            <QRCodeCanvas value={qrData} size={200} bgColor="#1f2937" fgColor="#ffffff" level="H" />
            <div className="text-center text-gray-200">
              <p className="font-semibold text-lg">{clientName}</p>
              <p>{selectedClientForQR.email}</p>
              <p>Plan: {membership.planName || "N/A"}</p>
              <p>DNI: {selectedClientForQR.dni || "N/A"}</p>
              <p>Código: {selectedClientForQR.alphanumericCode || "N/A"}</p>
              <p>Vence: {new Date(membershipEndDate).toLocaleDateString()}</p>
              <p className={status === "Active" ? "text-green-400" : "text-red-400"}>Estado: {status} ({daysRemaining} días restantes)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-orange-400 mb-6">Gestión de Clientes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {menuOptions.map((opt, index) => (
          <CardMenuOption
            key={index}
            icon={opt.icon}
            label={opt.label}
            description={opt.description}
            onClick={opt.action}
          />
        ))}
      </div>
    </div>
  );
};

export default ClientsAdmin;
