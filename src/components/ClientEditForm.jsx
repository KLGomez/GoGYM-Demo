// components/ClientEditForm.jsx
import React, { useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import CameraUploader from "./CameraUploader";
import { showSuccess } from "../utils/alerts";
import { SharedDataContext } from "../contexts/SharedDataContext";

const ClientEditForm = ({ initialClient, onCancel, onSave, CameraUploader, membershipPlans = [] }) => {
  const { updateClient: contextUpdateClient } = useContext(SharedDataContext);

  const EditSchema = Yup.object().shape({
    nombre: Yup.string(),
    apellido: Yup.string(),
    dni: Yup.string().matches(/^[0-9]+$/, "DNI debe contener solo números"),
    email: Yup.string().email("Email inválido"),
    telefono: Yup.string(),
    fechaNacimiento: Yup.date(),
    planAsignadoId: Yup.string(),
    notasInternas: Yup.string(),
    activo: Yup.boolean(),
    fotoUrl: Yup.string().url("La URL debe ser válida").notRequired(),
  });

  const handleSubmit = (values) => {
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
      : initialClient.membership;
    // Mantener el id y los campos no editables
    contextUpdateClient({ ...initialClient, ...values, membership });
    showSuccess("Cliente actualizado", "Los datos del cliente se guardaron correctamente.");
    if (onSave) onSave();
  };

  return (
    <Formik
      initialValues={{
        ...initialClient,
        planAsignadoId: initialClient.membership?.planId || initialClient.planAsignadoId || "",
        fotoUrl: initialClient.fotoUrl || ""
      }}
      validationSchema={EditSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting, isValid, setFieldValue, values }) => (
        <Form className="space-y-4 max-w-4xl bg-gray-800 p-6 rounded-lg shadow">
          <button
            type="button"
            onClick={onCancel}
            className="mb-4 text-orange-400 hover:text-orange-500"
          >
            &larr; Volver a la lista
          </button>
          <h2 className="text-xl font-bold mb-6 text-orange-400">Editar Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna izquierda: campos */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-200">Nombre</label>
                  <Field
                    name="nombre"
                    id="nombre"
                    type="text"
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <ErrorMessage name="nombre" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label htmlFor="apellido" className="block text-sm font-medium text-gray-200">Apellido</label>
                  <Field
                    name="apellido"
                    id="apellido"
                    type="text"
                    className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <ErrorMessage name="apellido" component="div" className="text-red-500 text-xs mt-1" />
                </div>
              </div>
              <div>
                <label htmlFor="dni" className="block text-sm font-medium text-gray-200">DNI</label>
                <Field
                  name="dni"
                  id="dni"
                  type="text"
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <ErrorMessage name="dni" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200">Email</label>
                <Field
                  name="email"
                  id="email"
                  type="email"
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-200">Teléfono</label>
                <Field
                  name="telefono"
                  id="telefono"
                  type="text"
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <ErrorMessage name="telefono" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-200">Fecha de Nacimiento</label>
                <Field
                  name="fechaNacimiento"
                  id="fechaNacimiento"
                  type="date"
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <ErrorMessage name="fechaNacimiento" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label htmlFor="planAsignadoId" className="block text-sm font-medium text-gray-200">Plan</label>
                <Field
                  as="select"
                  name="planAsignadoId"
                  id="planAsignadoId"
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
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
                <ErrorMessage name="planAsignadoId" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label htmlFor="notasInternas" className="block text-sm font-medium text-gray-200">Notas Internas</label>
                <Field
                  as="textarea"
                  name="notasInternas"
                  id="notasInternas"
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <ErrorMessage name="notasInternas" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <label htmlFor="activo" className="text-sm text-gray-200 mr-2">Estado:</label>
                <button
                  type="button"
                  onClick={() => setFieldValue("activo", !values.activo)}
                  className={`px-4 py-2 rounded-full font-semibold focus:outline-none transition-colors duration-200 ${values.activo ? "bg-green-500 text-white" : "bg-gray-600 text-gray-300"}`}
                  aria-pressed={values.activo}
                >
                  {values.activo ? "Activo" : "Inactivo"}
                </button>
              </div>
            </div>
            {/* Columna derecha: foto */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-200 mb-2">Foto del cliente</label>
              <CameraUploader onUploadComplete={(url) => setFieldValue("fotoUrl", url)} />
              {values.fotoUrl && (
                <img
                  src={values.fotoUrl}
                  alt="Foto del cliente"
                  className="mt-2 w-40 h-40 object-cover rounded"
                />
              )}
              {values.fotoUrl && (
                <button
                  type="button"
                  className="mt-2 text-orange-300 hover:underline text-xs"
                  onClick={() => setFieldValue("fotoUrl", "")}
                >
                  Quitar foto
                </button>
              )}
              <ErrorMessage name="fotoUrl" component="div" className="text-red-500 text-xs mt-1" />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar Cambios
          </button>
        </Form>
      )}
    </Formik>
  );

};

export default ClientEditForm;
