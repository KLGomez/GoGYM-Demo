import React, { useState, useContext } from "react"; // Importar useContext
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { SharedDataContext } from "../contexts/SharedDataContext"; // Importar el contexto
import {
  UserPlusIcon,
  QrCodeIcon as MenuQrCodeIcon,
  UsersIcon,
  Cog6ToothIcon,
  TrashIcon,
  XMarkIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { QRCodeCanvas } from 'qrcode.react';
import { showError, confirmAction } from "../utils/alerts";
// getClients y saveClients ya no se usan directamente, se accede vía contexto.
// import { getClients, saveClients } from "../utils/storage";
import { calculateMembershipDetails } from "../utils/membershipUtils";
import CardMenuOption from "../components/CardMenuOption";


// Esquema de validación con Yup
const ClientSchema = Yup.object().shape({
  firstName: Yup.string().required('El nombre es obligatorio'),
  // Añadir 'role' al esquema si se va a gestionar desde aquí.
  // role: Yup.string().oneOf(['user', 'admin']).required('El rol es obligatorio'), // Si se gestiona el rol aquí
  lastName: Yup.string().required('El apellido es obligatorio'),
  dni: Yup.string().required('El DNI es obligatorio').matches(/^[0-9]+$/, "DNI debe contener solo números"),
  email: Yup.string().email('Email inválido').required('El email es obligatorio'),
  birthDate: Yup.date().required('La fecha de nacimiento es obligatoria').nullable(),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .when('id', {
      is: (id) => !id,
      then: schema => schema.required('La contraseña es obligatoria'),
      otherwise: schema => schema.optional()
    }),
  plan: Yup.string().required('El plan es obligatorio'), // Este 'plan' es el planName
  // membershipDurationDays ya no se setea directamente desde aquí si el plan lo define
  // Si cada plan tiene su propia duración, este campo podría eliminarse del form de cliente
  // o hacerse opcional/informativo. Por ahora, lo mantenemos pero su valor vendrá del plan seleccionado.
  membershipDurationDays: Yup.number()
    .positive('La duración debe ser un número positivo')
    .integer('La duración debe ser un número entero')
    .required('La duración es obligatoria (se autocompletará al seleccionar un plan).'),
});


const ClientsAdmin = () => {
  const {
    clients: contextClients,
    addClient: contextAddClient,
    updateClient: contextUpdateClient,
    deleteClient: contextDeleteClient,
    isLoading
  } = useContext(SharedDataContext);

  const [view, setView] = useState("menu");
  // El estado local de 'clients' ya no es necesario, se usa contextClients.
  // const [clients, setClients] = useState(getClients());
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClientForQR, setSelectedClientForQR] = useState(null);

  // La persistencia ahora la maneja el SharedDataContext.
  // useEffect(() => {
  //   saveClients(clients);
  // }, [clients]);

  const initialFormValues = {
    id: '',
    firstName: '',
    // role: 'user',
    lastName: '',
    dni: '',
    email: '',
    birthDate: '',
    password: '',
    plan: '', // Ahora se seleccionará de una lista, empezar vacío
    membershipDurationDays: 0, // Se autocompletará o se ajustará
  };

  const handleSubmitClient = (values, { setSubmitting, resetForm }) => {
    const clientValues = { ...values };
    const selectedPlan = { name: values.plan, durationDays: 30 };

    // Preparar datos de membresía para anidar
    const membershipDetails = {
      planName: clientValues.plan, // Guardamos el nombre del plan
      membershipStartDate: editingClient?.membership?.membershipStartDate || new Date().toISOString(),
      // Usar la duración del plan seleccionado, o la del formulario si el plan no la define (fallback)
      membershipDurationDays: selectedPlan ? Number(selectedPlan.durationDays) : Number(clientValues.membershipDurationDays),
      autoRenew: editingClient?.membership?.autoRenew || false,
      // Otros detalles del plan como precio podrían copiarse aquí si se necesita denormalizar,
      // pero es mejor referenciarlos desde membershipPlans por ID o nombre para mantener consistencia.
    };

    if (editingClient) {
      const updatedClient = {
        ...editingClient,
        ...clientValues, // Aplicar campos del formulario (firstName, lastName, email, etc.)
        password: clientValues.password ? clientValues.password : editingClient.password, // Actualizar pass solo si se provee uno nuevo
        membership: { // Anidar/actualizar detalles de membresía
          ...(editingClient.membership || {}), // Mantener otros datos de membresía si existen
          ...membershipDetails
        },
        // El rol se actualizaría aquí si se gestiona en este formulario
        // role: clientValues.role || editingClient.role,
      };
      if (!clientValues.password) { // Si el campo de contraseña en el form está vacío, no se actualiza
        delete updatedClient.password;
      }
      contextUpdateClient(updatedClient); // Usar función del contexto
    } else {
      // Crear nuevo cliente
      const newClientBase = {
        ...clientValues,
        id: `client_${Date.now().toString()}`,
        // alphanumericCode se generará en el contexto al llamar a contextAddClient
        membership: membershipDetails,
        role: clientValues.role || 'user',
      };
      contextAddClient(newClientBase); // La función del contexto se encargará de añadir el alphanumericCode
    }

    resetForm();
    setEditingClient(null);
    setView("list");
    setSubmitting(false);
  };

  const handleEditClient = (clientToEdit) => {
    setEditingClient(clientToEdit); // Esto pasará los datos a initialValues de Formik vía enableReinitialize
    setView("add"); // Reutilizar la vista 'add' para el formulario
  };

  const handleDeleteClient = (clientId, clientFirstName, clientLastName) => {
    const fullName = `${clientFirstName || ''} ${clientLastName || ''}`.trim();
    confirmAction(
      `¿Eliminar Cliente "${fullName}"?`,
      `Esta acción es irreversible.`,
      "Sí, eliminar",
      () => {
        contextDeleteClient(clientId); // Usar función del contexto
        // El SweetAlert de éxito ya lo da contextDeleteClient
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
        setView("add");
      }
    },
    {
      icon: <UsersIcon className="w-8 h-8 text-white" />,
      label: "Lista de clientes",
      description: "Visualizar, editar o eliminar los clientes registrados.",
      action: () => setView("list"),
    },
    {
      icon: <Cog6ToothIcon className="w-8 h-8 text-white" />,
      label: "Configuración",
      description: "Opciones avanzadas de gestión (no disponible aún).",
      action: () => showError("Función no implementada", "La configuración aún no está disponible."),
    },
  ];


  // Renderizado del Formulario (Alta o Edición) con Formik
  if (view === "add") {
    return (
      <div>
        <button
          onClick={() => { setEditingClient(null); setView(editingClient ? "list" : "menu"); }}
          className="mb-4 text-orange-400 hover:text-orange-500"
        >
          &larr; {editingClient ? "Volver a la lista" : "Volver al menú"}
        </button>
        <h2 className="text-2xl font-bold text-orange-400 mb-6">
          {editingClient ? "Editar Cliente" : "Alta de Nuevo Cliente"}
        </h2>
        <Formik
          initialValues={editingClient ? { ...initialFormValues, ...editingClient, password: '' } : initialFormValues}
          validationSchema={ClientSchema}
          onSubmit={handleSubmitClient}
          enableReinitialize
        >
          {({ isSubmitting, dirty, isValid, values }) => {

            return (
              <Form className="space-y-4 max-w-lg bg-gray-800 p-6 rounded-lg">
                {/* Campos del formulario: firstName, lastName, dni, email, birthDate, password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-200">Nombre</label>
                    <Field type="text" name="firstName" id="firstName"
                      className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
                    <ErrorMessage name="firstName" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-200">Apellido</label>
                    <Field type="text" name="lastName" id="lastName"
                      className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
                    <ErrorMessage name="lastName" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                </div>
                <div>
                  <label htmlFor="dni" className="block text-sm font-medium text-gray-200">DNI</label>
                  <Field type="text" name="dni" id="dni"
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
                  <ErrorMessage name="dni" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-200">Email</label>
                  <Field type="email" name="email" id="email"
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-200">Fecha de Nacimiento</label>
                  <Field type="date" name="birthDate" id="birthDate"
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
                  <ErrorMessage name="birthDate" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                    Contraseña {editingClient && "(Dejar en blanco para no cambiar)"}
                  </label>
                  <Field type="password" name="password" id="password"
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500" />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label htmlFor="plan" className="block text-sm font-medium text-gray-200">Plan Asignado</label>
                  <Field
                    as="select"
                    name="plan"
                    id="plan"
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Seleccione un Plan</option>
                    <option value="Básico">Básico ($29.99) - 30 días</option>
                    <option value="Premium">Premium ($49.99) - 30 días</option>
                  </Field>
                  <ErrorMessage name="plan" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label htmlFor="membershipDurationDays" className="block text-sm font-medium text-gray-200">Duración Membresía (días)</label>
                  <Field
                    type="number" name="membershipDurationDays" id="membershipDurationDays" min="1" readOnly={Boolean(values.plan)} // Hacerlo readOnly si hay un plan seleccionado
                    className={`mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500 ${values.plan ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : ''}`}
                  />
                  <ErrorMessage name="membershipDurationDays" component="div" className="text-red-500 text-xs mt-1" />
                  <p className="text-xs text-gray-400 mt-1">
                    {values.plan ? "La duración se establece automáticamente según el plan." : "Ingrese duración si no selecciona un plan predefinido."}
                  </p>
                </div>

                <button type="submit"
                  disabled={isSubmitting || !dirty || !isValid}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md shadow disabled:opacity-50 disabled:cursor-not-allowed">
                  {editingClient ? "Actualizar Cliente" : "Guardar Cliente"}
                </button>
                {editingClient && (
                  <button type="button"
                    onClick={() => { setEditingClient(null); setView("list"); }}
                    className="mt-2 w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md shadow">
                    Cancelar Edición
                  </button>
                )}
              </Form>
            );
          }}
        </Formik>
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
        {isLoading && <p className="text-gray-400">Cargando clientes...</p>}
        {!isLoading && contextClients.length === 0 ? (
          <p className="text-gray-400">No hay clientes registrados.</p>
        ) : (
          <div className="space-y-3">
            {contextClients.map((client) => {
              // Usar client.membership.membershipStartDate y client.membership.membershipDurationDays
              const { daysRemaining, status } = calculateMembershipDetails(
                client.membership?.membershipStartDate,
                client.membership?.membershipDurationDays
              );
              const clientNameForDisplay = `${client.firstName || ''} ${client.lastName || ''}`.trim();
              return (
                <div key={client.id} className="bg-gray-800 p-4 rounded-lg shadow ">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <p className="font-semibold text-white">{clientNameForDisplay} <span className="text-xs text-gray-500">({client.role || 'user'})</span></p>
                      <p className="text-sm text-gray-300">DNI: {client.dni || 'N/A'} - Email: {client.email}</p>
                      <p className="text-sm text-gray-300">
                        Plan: {client.membership?.planName || 'N/A'} - Código: {client.alphanumericCode || 'N/A'}
                      </p>
                      <p className={`text-sm ${status === "Active" ? 'text-green-400' : 'text-red-400'}`}>
                        Estado Membresía: {status} ({daysRemaining} días restantes)
                      </p>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleEditClient(client)}
                        className="text-blue-400 hover:text-blue-600 p-1"
                        title="Editar Cliente"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleShowQR(client)}
                        className="text-teal-400 hover:text-teal-600 p-1"
                        title="Generar QR"
                      >
                        <MenuQrCodeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id, client.firstName, client.lastName)} // Pasar nombres separados
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
          onClick={() => {
            setEditingClient(null); // Asegurar que no estemos en modo edición
            setView("add");
          }}
          className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md shadow flex items-center gap-2"
        >
          <UserPlusIcon className="w-5 h-5" />
          Agregar Nuevo Cliente
        </button>
      </div>
    );
  }

  // Renderizado del Modal QR
  if (view === "qr" && selectedClientForQR) {
    const clientNameForDisplay = `${selectedClientForQR.firstName || ''} ${selectedClientForQR.lastName || ''}`.trim() || selectedClientForQR.name;
    // Para el QR, necesitamos los datos de membresía que están DENTRO del objeto cliente
    const membership = selectedClientForQR.membership || {};
    const { membershipEndDate, daysRemaining, status } = calculateMembershipDetails(
      membership.membershipStartDate,
      membership.membershipDurationDays
    );

    const qrDataToEncode = {
      clientId: selectedClientForQR.id,
      name: clientNameForDisplay,
      email: selectedClientForQR.email,
      plan: membership.planName, // Usar el planName desde el objeto membership del cliente
      membershipEndDate: membershipEndDate,
      status: status,
      alphanumericCode: selectedClientForQR.alphanumericCode
    };
    const qrDataString = JSON.stringify(qrDataToEncode);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-orange-400">Código QR de Acceso</h3>
            <button onClick={() => { setSelectedClientForQR(null); setView('list'); }} className="text-gray-400 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-4">
            <QRCodeCanvas value={qrDataString} size={200} bgColor="#1f2937" fgColor="#ffffff" level="H" />
            <div className="text-center text-gray-200">
              <p className="font-semibold text-lg">{clientNameForDisplay}</p>
              <p>{selectedClientForQR.email}</p>
              <p>Plan: {membership.planName || 'N/A'}</p> {/* Usar el planName desde el objeto membership */}
              <p>DNI: {selectedClientForQR.dni || 'N/A'}</p>
              <p>Código: {selectedClientForQR.alphanumericCode || 'N/A'}</p>
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

  return (
    <div>
      <h2 className="text-3xl font-bold text-orange-400 mb-6">Gestión de Clientes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {menuOptions.map((opt, index) => (
          <CardMenuOption
            key={index}
            icon={opt.icon}
            label={opt.label}
            description={opt.description || "Accedé a esta funcionalidad para más detalles."}
            onClick={opt.action}
          />
        ))}
      </div>

    </div>
  );
};

export default ClientsAdmin;
