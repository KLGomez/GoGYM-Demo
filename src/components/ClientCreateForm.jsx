// ClientCreateForm.jsx
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import CameraUploader from "./CameraUploader";
import { getClients, saveClients } from "../utils/storage";
import { showSuccess } from "../utils/alerts";

const ClientCreateForm = ({ onCancel, onSave, editingClient, membershipPlans = [] }) => {
  const initialValues = editingClient || {
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    fechaNacimiento: "",
    planAsignadoId: "",
    notasInternas: "",
    fotoUrl: "",
  };

  const validationSchema = Yup.object({
    nombre: Yup.string().required("El nombre es obligatorio"),
    apellido: Yup.string().required("El apellido es obligatorio"),
    dni: Yup.string()
      .required("El DNI es obligatorio")
      .matches(/^\d+$/, "Solo números"),
    email: Yup.string()
      .email("Email inválido")
      .required("El email es obligatorio"),
    telefono: Yup.string().required("El teléfono es obligatorio"),
    fechaNacimiento: Yup.date().required(
      "La fecha de nacimiento es obligatoria"
    ),
  planAsignadoId: Yup.string().required("El plan es obligatorio"),
    notasInternas: Yup.string(),
    fotoUrl: Yup.string().url("La URL debe ser válida").notRequired(),
  });

  const handleSubmit = (values) => {
    const clients = getClients();
    // Buscar el plan seleccionado
    const selectedPlan = membershipPlans.find(plan => plan.id === values.planAsignadoId);
    // Crear objeto membership si hay plan seleccionado
    const membership = selectedPlan
      ? {
          planName: selectedPlan.name || selectedPlan.nombre || selectedPlan.planName,
          membershipStartDate: new Date().toISOString(),
          membershipDurationDays: selectedPlan.duracionEnDias || selectedPlan.durationDays || selectedPlan.membershipDurationDays || 30,
          autoRenew: false
        }
      : undefined;

    // Mapeo para visualización interna (no afecta envío al backend)
    const mappedValues = {
      ...values,
      firstName: values.nombre,
      lastName: values.apellido
    };

    if (editingClient) {
      // Editar cliente
      const updated = clients.map((c) =>
        c.id === editingClient.id
          ? { ...mappedValues, id: editingClient.id, membership }
          : c
      );
      saveClients(updated);
      showSuccess("Cliente actualizado", "Los datos del cliente se guardaron correctamente.");
    } else {
      // Alta nuevo cliente
      const newClient = { ...mappedValues, id: Date.now(), membership };
      saveClients([...clients, newClient]);
      showSuccess("Cliente creado", "El cliente fue registrado exitosamente.");
    }
    if (onSave) onSave();
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, setFieldValue, values, isValid, dirty }) => (
        <Form className="space-y-4 max-w-4xl bg-gray-800 p-6 rounded-lg shadow">
          {/* Flecha para volver */}
          <button
            type="button"
            onClick={onCancel}
            className="mb-4 text-orange-400 hover:text-orange-500"
          >
            &larr; {editingClient ? "Volver a la lista" : "Volver al menú"}
          </button>

          {/* Layout en dos columnas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna izquierda: campos */}
            <div className="md:col-span-2 space-y-4">
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-sm font-medium text-gray-200"
                  >
                    Nombre
                  </label>
                  <Field
                    name="nombre"
                    id="nombre"
                    type="text"
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 
                               focus:ring-orange-500 focus:border-orange-500"
                  />
                  <ErrorMessage
                    name="nombre"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="apellido"
                    className="block text-sm font-medium text-gray-200"
                  >
                    Apellido
                  </label>
                  <Field
                    name="apellido"
                    id="apellido"
                    type="text"
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 
                               focus:ring-orange-500 focus:border-orange-500"
                  />
                  <ErrorMessage
                    name="apellido"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              </div>

              {/* DNI */}
              <div>
                <label
                  htmlFor="dni"
                  className="block text-sm font-medium text-gray-200"
                >
                  DNI
                </label>
                <Field
                  name="dni"
                  id="dni"
                  type="text"
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 
                             focus:ring-orange-500 focus:border-orange-500"
                />
                <ErrorMessage
                  name="dni"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-200"
                >
                  Email
                </label>
                <Field
                  name="email"
                  id="email"
                  type="email"
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 
                             focus:ring-orange-500 focus:border-orange-500"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label
                  htmlFor="telefono"
                  className="block text-sm font-medium text-gray-200"
                >
                  Teléfono
                </label>
                <Field
                  name="telefono"
                  id="telefono"
                  type="text"
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 
                             focus:ring-orange-500 focus:border-orange-500"
                />
                <ErrorMessage
                  name="telefono"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Fecha Nacimiento */}
              <div>
                <label
                  htmlFor="fechaNacimiento"
                  className="block text-sm font-medium text-gray-200"
                >
                  Fecha de Nacimiento
                </label>
                <Field
                  name="fechaNacimiento"
                  id="fechaNacimiento"
                  type="date"
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 
                             focus:ring-orange-500 focus:border-orange-500"
                />
                <ErrorMessage
                  name="fechaNacimiento"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Plan Asignado */}
              <div>
                <label
                  htmlFor="planAsignadoId"
                  className="block text-sm font-medium text-gray-200"
                >
                  Plan Asignado
                </label>
                <Field
                  as="select"
                  name="planAsignadoId"
                  id="planAsignadoId"
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 
                             focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Seleccionar plan</option>
                  {membershipPlans && membershipPlans.length > 0 ? (
                    membershipPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name || plan.nombre || plan.planName}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No hay planes disponibles</option>
                  )}
                </Field>
                <ErrorMessage
                  name="planAsignadoId"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Notas Internas */}
              <div>
                <label
                  htmlFor="notasInternas"
                  className="block text-sm font-medium text-gray-200"
                >
                  Notas Internas
                </label>
                <Field
                  as="textarea"
                  name="notasInternas"
                  id="notasInternas"
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 
                             focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Columna derecha: foto */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Foto del cliente
              </label>
              <CameraUploader
                onUploadSuccess={(url) => setFieldValue("fotoUrl", url)}
              />
              {values.fotoUrl && (
                <img
                  src={values.fotoUrl}
                  alt="Preview"
                  className="mt-2 w-40 h-40 object-cover rounded"
                />
              )}
              <ErrorMessage
                name="fotoUrl"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>
          </div>

          {/* Botones */}
          <button
            type="submit"
            disabled={isSubmitting || !dirty || !isValid}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 
                       rounded-md shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingClient ? "Actualizar Cliente" : "Guardar Cliente"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="mt-2 w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 
                       rounded-md shadow"
          >
            Cancelar
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default ClientCreateForm;
