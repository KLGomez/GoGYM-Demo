// components/ClientEditForm.jsx
import React, { useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
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
    activo: Yup.boolean()
  });

  const handleSubmit = (values) => {
    const selectedPlan = membershipPlans.find(plan => (plan.id || plan._id) === values.planAsignadoId);
    const clientId = initialClient._id || initialClient.id;
    // Si el plan no cambió, mantener fechas y planAsignadoId
    let planAsignadoId = initialClient.planAsignadoId;
    let fechaInicioMembresia = initialClient.fechaInicioMembresia;
    let fechaFinMembresia = initialClient.fechaFinMembresia;
    if (selectedPlan && values.planAsignadoId !== initialClient.planAsignadoId) {
      planAsignadoId = selectedPlan.id || selectedPlan._id;
      fechaInicioMembresia = new Date().toISOString();
      const end = new Date();
      end.setDate(end.getDate() + (selectedPlan.duracionEnDias || selectedPlan.durationDays || selectedPlan.membershipDurationDays || 30));
      fechaFinMembresia = end.toISOString();
    }
    const clientToUpdate = {
      ...initialClient,
      ...values,
      id: clientId,
      planAsignadoId,
      fechaInicioMembresia,
      fechaFinMembresia
    };
    delete clientToUpdate.membership;
    if ('rol' in clientToUpdate) {
      delete clientToUpdate.rol;
    }
    contextUpdateClient(clientToUpdate);
    showSuccess("Cliente actualizado", "Los datos del cliente se guardaron correctamente.");
    if (onSave) onSave();
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg shadow-md text-white">
      <button
        type="button"
        onClick={onCancel}
        className="mb-4 text-orange-400 hover:text-orange-500"
      >
        &larr; Volver a la lista
      </button>
      <h2 className="text-xl font-bold mb-6 text-orange-400">Editar Cliente</h2>
      <Formik
        initialValues={{
          ...initialClient,
          fechaNacimiento: initialClient.fechaNacimiento
            ? (typeof initialClient.fechaNacimiento === 'string' && initialClient.fechaNacimiento.includes('T')
              ? initialClient.fechaNacimiento.slice(0, 10)
              : initialClient.fechaNacimiento)
            : "",
          planAsignadoId: initialClient.planAsignadoId || ""
        }}
        validationSchema={EditSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, isValid, setFieldValue, values }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-200">Nombre</label>
                <Field
                  name="nombre"
                  type="text"
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-orange-500 focus:border-orange-500"
                />
                <ErrorMessage name="nombre" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-200">Apellido</label>
                <Field
                  name="apellido"
                  type="text"
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-orange-500 focus:border-orange-500"
                />
                <ErrorMessage name="apellido" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label htmlFor="dni" className="block text-sm font-medium text-gray-200">DNI</label>
                <Field
                  name="dni"
                  type="text"
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-orange-500 focus:border-orange-500"
                />
                <ErrorMessage name="dni" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200">Email</label>
                <Field
                  name="email"
                  type="email"
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-orange-500 focus:border-orange-500"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-200">Teléfono</label>
                <Field
                  name="telefono"
                  type="text"
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-orange-500 focus:border-orange-500"
                />
                <ErrorMessage name="telefono" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-200">Fecha de Nacimiento</label>
                <Field
                  name="fechaNacimiento"
                  type="date"
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-orange-500 focus:border-orange-500"
                />
                <ErrorMessage name="fechaNacimiento" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label htmlFor="planAsignadoId" className="block text-sm font-medium text-gray-200">Plan</label>
                <Field
                  name="planAsignadoId"
                  as="select"
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-orange-500 focus:border-orange-500"
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
              <div className="md:col-span-2">
                <label htmlFor="notasInternas" className="block text-sm font-medium text-gray-200">Notas Internas</label>
                <Field
                  name="notasInternas"
                  as="textarea"
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-orange-500 focus:border-orange-500"
                />
                <ErrorMessage name="notasInternas" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <label htmlFor="activo" className="text-sm text-gray-200 mr-2">Estado:</label>
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
    </div>
  );
};

export default ClientEditForm;
