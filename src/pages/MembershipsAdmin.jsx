import React, { useState, useMemo, useContext } from 'react';
import { CreditCardIcon, CurrencyDollarIcon, ArrowLeftIcon, UserCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SharedDataContext } from '../contexts/SharedDataContext';
import { calculateMembershipDetails } from '../utils/membershipUtils'; // Para calcular estado y días restantes
import { Link } from 'react-router-dom'; // Para enlazar a la ficha del cliente

const MembershipsAdmin = () => {
  const { clients: contextClients, isLoading } = useContext(SharedDataContext);
  const [currentView, setCurrentView] = useState("menu"); // "menu", "statusView"
  const [filterStatus, setFilterStatus] = useState("Todos"); // "Todos", "Active", "Expired", "SoonToExpire"
  const [searchTerm, setSearchTerm] = useState("");

  const clientsWithMembershipDetails = useMemo(() => {
    if (isLoading || !contextClients) return [];
    return contextClients.map(client => {
      const membershipDetails = calculateMembershipDetails(
        client.membership?.membershipStartDate,
        client.membership?.membershipDurationDays
      );
      return { ...client, membershipStatusDetails: membershipDetails };
    });
  }, [contextClients, isLoading]);

  const filteredClients = useMemo(() => {
    let clients = clientsWithMembershipDetails;
    if (filterStatus !== "Todos") {
      clients = clients.filter(client => client.membershipStatusDetails.status === filterStatus);
    }
    if (searchTerm) {
      clients = clients.filter(client =>
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.dni.includes(searchTerm) ||
        client.alphanumericCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return clients.sort((a,b) => (a.lastName || "").localeCompare(b.lastName || ""));
  }, [clientsWithMembershipDetails, filterStatus, searchTerm]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "text-green-400";
      case "Expired": return "text-red-400";
      case "SoonToExpire": return "text-yellow-400";
      default: return "text-gray-400";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString + 'T00:00:00Z').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  };

  const menuOptions = [
    {
      icon: <CreditCardIcon className="w-10 h-10 text-white" />,
      label: "Estado de Membresías",
      action: () => setCurrentView("statusView"),
      description: "Ver y filtrar el estado actual de todas las membresías de clientes."
    },
    {
      icon: <CurrencyDollarIcon className="w-10 h-10 text-white" />,
      label: "Gestión de Pagos",
      action: () => { /* Placeholder: Futura vista de pagos */ alert("Funcionalidad de Pagos no implementada aún."); },
      description: "Registrar y consultar pagos de membresías (Próximamente)."
    },
  ];

  if (isLoading && currentView !== "menu") {
      return <p className="text-gray-300 text-center py-10">Cargando datos de membresías...</p>;
  }

  if (currentView === "menu") {
    return (
      <div>
        <h2 className="text-3xl font-bold text-orange-400 mb-8">Gestión de Membresías</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.action}
              className="bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center text-center transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {opt.icon}
              <span className="font-semibold text-xl mt-3 mb-1 text-orange-400">{opt.label}</span>
              <p className="text-sm text-gray-400">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (currentView === "statusView") {
    return (
      <div>
        <button
          onClick={() => setCurrentView("menu")}
          className="mb-6 text-orange-400 hover:text-orange-500 flex items-center font-semibold"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Volver al Menú de Membresías
        </button>
        <h2 className="text-3xl font-bold text-orange-400 mb-6">Estado de Membresías de Clientes</h2>

        {/* Filtros */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow-md flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-grow w-full sm:w-auto">
            <label htmlFor="searchTerm" className="sr-only">Buscar cliente</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="searchTerm"
                placeholder="Buscar por nombre, email, DNI, código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-10 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="statusFilter" className="sr-only">Filtrar por estado</label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Active">Activas</option>
              <option value="Expired">Vencidas</option>
              <option value="SoonToExpire">Próximas a Vencer</option>
            </select>
          </div>
        </div>

        {filteredClients.length === 0 && !isLoading ? (
            <p className="text-gray-400 text-center py-8">No hay clientes que coincidan con los filtros seleccionados.</p>
        ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-750">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Cliente</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Plan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Inicio</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Fin / Renovación</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Días Restantes</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserCircleIcon className="h-8 w-8 text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-white">{client.firstName} {client.lastName}</div>
                        <div className="text-xs text-gray-400">{client.email}</div>
                        <div className="text-xs text-gray-500">DNI: {client.dni} - Código: {client.alphanumericCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{client.membership?.planName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.membershipStatusDetails.status === "Active" ? 'bg-green-800 text-green-300' :
                      client.membershipStatusDetails.status === "Expired" ? 'bg-red-800 text-red-300' :
                      client.membershipStatusDetails.status === "SoonToExpire" ? 'bg-yellow-800 text-yellow-300' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {client.membershipStatusDetails.status === "SoonToExpire" ? "Por Vencer" : client.membershipStatusDetails.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(client.membership?.membershipStartDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(client.membershipStatusDetails.endDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium" style={{ color: getStatusColor(client.membershipStatusDetails.status).replace('text-', '') }}>
                    {client.membershipStatusDetails.daysRemaining < 0 && client.membershipStatusDetails.status === "Expired" ? "Vencida" :
                     client.membershipStatusDetails.daysRemaining >= 0 ? client.membershipStatusDetails.daysRemaining : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {/* Enlace a la vista de edición del cliente en ClientesAdmin */}
                    {/* Esto requeriría pasar una función para cambiar la vista en AppAdmin o usar un Link más complejo */}
                    <Link to={`/admin/clients?edit=${client.id}&from=memberships`}
                          className="text-orange-400 hover:text-orange-300 hover:underline">
                      Ver/Editar Ficha
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    );
  }

  // Fallback por si acaso (no debería llegar aquí)
  return (
    <div>
      <h2 className="text-3xl font-bold text-primary mb-6">Membresías</h2>
      <p className="text-gray-400">Vista no reconocida. Por favor, vuelva al menú.</p>
      <button onClick={() => setCurrentView("menu")} className="mt-4 text-orange-400 hover:text-orange-500">
        Volver al Menú
      </button>
    </div>
  );
};

export default MembershipsAdmin;
