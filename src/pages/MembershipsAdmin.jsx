import React, { useState, useMemo, useContext } from 'react';
import {
  CreditCardIcon, CurrencyDollarIcon, ArrowLeftIcon, UserCircleIcon,
  MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon
} from "@heroicons/react/24/outline";
import { SharedDataContext } from '../contexts/SharedDataContext';
import { calculateMembershipDetails } from '../utils/membershipUtils';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { showError, confirmAction } from '../utils/alerts';

// Esquema de validación para Tipos de Plan (creación)
const MembershipPlanSchema = Yup.object().shape({
  nombre: Yup.string().required('El nombre del plan es obligatorio.'),
  precio: Yup.number().positive('El precio debe ser un número positivo.').required('El precio es obligatorio.'),
  duracionEnDias: Yup.number().positive('La duración debe ser un número positivo entero.').integer().required('La duración en días es obligatoria.'),
  descripcion: Yup.string(),
  activo: Yup.boolean()
});

const MembershipPlanForm = ({ onSubmit, initialData, onCancel }) => {
  const isEdit = Boolean(initialData?.id);
  return (
    <Formik
      initialValues={{
        nombre: initialData?.nombre || '',
        precio: initialData?.precio || '',
        duracionEnDias: initialData?.duracionEnDias || 30,
        descripcion: initialData?.descripcion || '',
        activo: typeof initialData?.activo === 'boolean' ? initialData.activo : true,
        id: initialData?.id || null
      }}
      validationSchema={isEdit ? undefined : MembershipPlanSchema}
      onSubmit={(values, { setSubmitting }) => {
        onSubmit(values);
        setSubmitting(false);
      }}
      enableReinitialize
    >
      {({ isSubmitting, dirty, isValid, setFieldValue, values }) => (
        <Form className="space-y-4 max-w-lg bg-gray-800 p-6 rounded-lg shadow-xl">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-200">Nombre del Plan</label>
            <Field type="text" name="nombre" className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
            <ErrorMessage name="nombre" component="div" className="text-red-500 text-xs mt-1" />
          </div>
          <div>
            <label htmlFor="precio" className="block text-sm font-medium text-gray-200">Precio (ej: 29.99)</label>
            <Field type="number" name="precio" step="0.01" className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
            <ErrorMessage name="precio" component="div" className="text-red-500 text-xs mt-1" />
          </div>
          <div>
            <label htmlFor="duracionEnDias" className="block text-sm font-medium text-gray-200">Duración del Plan (días)</label>
            <Field type="number" name="duracionEnDias" min="1" className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
            <ErrorMessage name="duracionEnDias" component="div" className="text-red-500 text-xs mt-1" />
          </div>
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-200">Descripción (opcional)</label>
            <Field as="textarea" name="descripcion" rows="3" className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
            <ErrorMessage name="descripcion" component="div" className="text-red-500 text-xs mt-1" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <label htmlFor="activo" className="text-sm text-gray-200">Estado:</label>
            <button
              type="button"
              onClick={() => setFieldValue("activo", !values.activo)}
              className={`px-4 py-2 rounded-full font-semibold focus:outline-none transition-colors duration-200
                ${values.activo ? "bg-green-500 text-white" : "bg-gray-600 text-gray-300"}`}
              aria-pressed={values.activo}
            >
              {values.activo ? "Activo" : "Inactivo"}
            </button>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onCancel} className="py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-700">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting || !dirty || !isValid} className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow disabled:opacity-50">
              {isEdit ? 'Actualizar Plan' : 'Crear Plan'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};


const MembershipsAdmin = () => {
  const {
    clients: contextClients,
    membershipPlans: contextMembershipPlans,
    addMembershipPlan,
    updateMembershipPlan,
    deleteMembershipPlan,
    isLoading
  } = useContext(SharedDataContext);

  const [currentView, setCurrentView] = useState("menu"); // "menu", "statusView", "managePlansView"
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPlanFormVisible, setIsPlanFormVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const clientsWithMembershipDetails = useMemo(() => {
    if (isLoading || !contextClients) return [];
    return contextClients.map(client => {
      const membershipDetails = calculateMembershipDetails(
        client.membership?.membershipStartDate,
        client.membership?.membershipDurationDays
      );
      // Asegurarse de que el planName en el cliente coincida con un plan existente, o mostrar "N/A"
      const plan = (contextMembershipPlans || []).find(p => p.name === client.membership?.planName);
      return {
        ...client,
        membershipStatusDetails: membershipDetails,
        effectivePlanName: plan ? plan.name : (client.membership?.planName || 'N/A (Plan no encontrado)')
      };
    });
  }, [contextClients, contextMembershipPlans, isLoading]);

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
        client.alphanumericCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.effectivePlanName?.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Normaliza los datos para localStorage/backend (creación y edición)
  const handlePlanFormSubmit = (values) => {
    // Si es edición, solo enviar campos modificados (PATCH)
    if (editingPlan) {
      const patch = { id: editingPlan.id };
      // Solo incluir campos que cambiaron o están presentes
      ["nombre", "precio", "duracionEnDias", "descripcion", "activo"].forEach((key) => {
        if (values[key] !== undefined && values[key] !== editingPlan[key]) {
          patch[key] = values[key];
        }
      });
      updateMembershipPlan(patch);
    } else {
      // Para creación, enviar todos los campos requeridos
      const nuevoPlan = {
        nombre: values.nombre,
        precio: Number(values.precio),
        duracionEnDias: Number(values.duracionEnDias),
        descripcion: values.descripcion || "",
        activo: typeof values.activo === "boolean" ? values.activo : true
      };
      addMembershipPlan(nuevoPlan);
    }
    setIsPlanFormVisible(false);
    setEditingPlan(null);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setIsPlanFormVisible(true);
  };

  const handleDeletePlan = (planId, planName) => {
    confirmAction(
      `¿Eliminar Plan "${planName}"?`,
      "Esta acción es irreversible. Los clientes con este plan podrían necesitar una actualización manual.",
      "Sí, eliminar",
      () => deleteMembershipPlan(planId)
    );
  };

  const menuOptions = [
    {
      icon: <CreditCardIcon className="w-10 h-10 text-white" />,
      label: "Gestionar Tipos de Plan",
      action: () => setCurrentView("managePlansView"),
      description: "Crear, editar y eliminar los diferentes planes de membresía ofrecidos."
    },
    {
      icon: <UserCircleIcon className="w-10 h-10 text-white" />,
      label: "Estado de Membresías de Clientes",
      action: () => setCurrentView("statusView"),
      description: "Ver y filtrar el estado actual de todas las membresías de clientes."
    },
/*     {
      icon: <CurrencyDollarIcon className="w-10 h-10 text-white" />,
      label: "Gestión de Pagos",
      action: () => { showError("Próximamente", "La funcionalidad de Gestión de Pagos aún no está implementada."); },
      description: "Registrar y consultar pagos de membresías (Próximamente)."
    }, */
  ];

  if (isLoading && currentView !== "menu") {
      return <p className="text-gray-300 text-center py-10">Cargando datos...</p>;
  }

  // --- VISTA DE MENÚ PRINCIPAL ---
  if (currentView === "menu") {
    return (
      <div>
        <h2 className="text-3xl font-bold text-orange-400 mb-8">Gestión de Membresías y Planes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {menuOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.action}
              className="bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-start text-center transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[180px]"
            >
              {opt.icon}
              <span className="font-semibold text-xl mt-3 mb-1 text-orange-400">{opt.label}</span>
              <p className="text-sm text-gray-400 flex-grow">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- VISTA PARA GESTIONAR TIPOS DE PLAN ---
  if (currentView === "managePlansView") {
    return (
      <div>
        <button onClick={() => setCurrentView("menu")} className="mb-6 text-orange-400 hover:text-orange-500 flex items-center font-semibold">
          <ArrowLeftIcon className="w-5 h-5 mr-2" /> Volver al Menú de Membresías
        </button>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-orange-400">Gestionar Tipos de Plan</h2>
          <button onClick={() => { setEditingPlan(null); setIsPlanFormVisible(!isPlanFormVisible);}}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow flex items-center gap-2">
            <PlusIcon className="w-5 h-5" /> {isPlanFormVisible && !editingPlan ? 'Cancelar' : 'Crear Nuevo Plan'}
          </button>
        </div>

        {isPlanFormVisible && (
          <div className="mb-8">
            <MembershipPlanForm
              onSubmit={handlePlanFormSubmit}
              initialData={editingPlan}
              onCancel={() => { setIsPlanFormVisible(false); setEditingPlan(null); }}
            />
          </div>
        )}

        <h3 className="text-xl font-semibold text-white mb-4 mt-8">Planes Existentes</h3>
        {(contextMembershipPlans || []).length === 0 && !isLoading ? (
          <p className="text-gray-400">No hay tipos de plan definidos.</p>
        ) : (
          <div className="space-y-4">
            {(contextMembershipPlans || []).map(plan => (
              <div key={plan.id} className="bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-start">
                <div>
                  <p className="font-semibold text-xl text-orange-400">{plan.nombre || plan.name}</p>
                  <p className="text-gray-300">Precio: ${parseFloat(plan.precio ?? plan.price).toFixed(2)}</p>
                  <p className="text-gray-300">Duración: {plan.duracionEnDias ?? plan.durationDays} días</p>
                  <p className="text-xs text-gray-400 mt-1 whitespace-pre-line">{plan.descripcion || plan.benefits}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${plan.activo === false ? "bg-gray-600 text-gray-300" : "bg-green-700 text-green-200"}`}>
                    {plan.activo === false ? "Inactivo" : "Activo"}
                  </span>
                </div>
                <div className="flex space-x-2 flex-shrink-0 mt-1">
                  <button onClick={() => handleEditPlan(plan)} className="p-2 text-blue-400 hover:text-blue-300" title="Editar Plan"><PencilIcon className="w-5 h-5" /></button>
                  <button onClick={() => handleDeletePlan(plan.id, plan.nombre || plan.name)} className="p-2 text-red-500 hover:text-red-400" title="Eliminar Plan"><TrashIcon className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- VISTA DE ESTADO DE MEMBRESÍAS DE CLIENTES ---
  if (currentView === "statusView") {
    return (
      <div>
        <button onClick={() => setCurrentView("menu")} className="mb-6 text-orange-400 hover:text-orange-500 flex items-center font-semibold">
          <ArrowLeftIcon className="w-5 h-5 mr-2" /> Volver al Menú de Membresías
        </button>
        <h2 className="text-3xl font-bold text-orange-400 mb-6">Estado de Membresías de Clientes</h2>

        <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow-md flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-grow w-full sm:w-auto">
            <label htmlFor="searchTerm" className="sr-only">Buscar cliente</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text" id="searchTerm" placeholder="Buscar por nombre, email, DNI, código..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-10 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="statusFilter" className="sr-only">Filtrar por estado</label>
            <select id="statusFilter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-orange-500 focus:border-orange-500">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Inicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Fin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Días Rest.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserCircleIcon className="h-8 w-8 text-gray-500 mr-3 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-white">{client.firstName} {client.lastName}</div>
                        <div className="text-xs text-gray-400">{client.email}</div>
                        <div className="text-xs text-gray-500">DNI: {client.dni} - Cód: {client.alphanumericCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{client.effectivePlanName}</td>
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
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-medium ${getStatusColor(client.membershipStatusDetails.status)}`}>
                    {client.membershipStatusDetails.daysRemaining < 0 && client.membershipStatusDetails.status === "Expired" ? "Vencida" :
                     client.membershipStatusDetails.daysRemaining >= 0 ? client.membershipStatusDetails.daysRemaining : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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

  return (
    <div>
      <h2 className="text-3xl font-bold text-orange-400 mb-6">Error de Vista</h2>
      <p className="text-gray-400">Vista no reconocida. Por favor, vuelva al menú.</p>
      <button onClick={() => setCurrentView("menu")} className="mt-4 text-orange-400 hover:text-orange-500">
        Volver al Menú Principal de Membresías
      </button>
    </div>
  );
};

export default MembershipsAdmin;
