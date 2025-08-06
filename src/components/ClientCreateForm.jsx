// components/ClientCreateForm.jsx
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import CameraUploader from "./CameraUploader";

const ClientCreateForm = ({ onSubmit, onCancel }) => {
  const initialValues = {
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    fechaNacimiento: "",
    planAsignadoId: "",
    notasInternas: "",
    fotoUrl: "", // Esta la vamos a llenar desde CameraUploader
  };

  const validationSchema = Yup.object({
    nombre: Yup.string().required("El nombre es obligatorio"),
    apellido: Yup.string().required("El apellido es obligatorio"),
    dni: Yup.string().required("El DNI es obligatorio").matches(/^\d+$/, "Solo números"),
    email: Yup.string().email("Email inválido").required("El email es obligatorio"),
    telefono: Yup.string().required("El teléfono es obligatorio"),
    fechaNacimiento: Yup.date().required("La fecha de nacimiento es obligatoria"),
    planAsignadoId: Yup.string().required("El plan es obligatorio"),
    notasInternas: Yup.string(), // opcional
    fotoUrl: Yup.string().url().required("La foto es obligatoria"),
  });

  return (
    
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, setFieldValue, values, isValid, dirty }) => (
        <Form className="space-y-4 max-w-lg bg-gray-800 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm text-gray-200">Nombre</label>
              <Field name="nombre" className="input" />
              <ErrorMessage name="nombre" component="div" className="text-red-400 text-xs" />
            </div>
            <div>
              <label htmlFor="apellido" className="block text-sm text-gray-200">Apellido</label>
              <Field name="apellido" className="input" />
              <ErrorMessage name="apellido" component="div" className="text-red-400 text-xs" />
            </div>
          </div>

          <div>
            <label htmlFor="dni" className="block text-sm text-gray-200">DNI</label>
            <Field name="dni" className="input" />
            <ErrorMessage name="dni" component="div" className="text-red-400 text-xs" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-gray-200">Email</label>
            <Field name="email" type="email" className="input" />
            <ErrorMessage name="email" component="div" className="text-red-400 text-xs" />
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm text-gray-200">Teléfono</label>
            <Field name="telefono" className="input" />
            <ErrorMessage name="telefono" component="div" className="text-red-400 text-xs" />
          </div>

          <div>
            <label htmlFor="fechaNacimiento" className="block text-sm text-gray-200">Fecha de Nacimiento</label>
            <Field name="fechaNacimiento" type="date" className="input" />
            <ErrorMessage name="fechaNacimiento" component="div" className="text-red-400 text-xs" />
          </div>

          <div>
            <label htmlFor="planAsignadoId" className="block text-sm text-gray-200">Plan Asignado</label>
            <Field as="select" name="planAsignadoId" className="input">
              <option value="">Seleccionar plan</option>
              <option value="plan1">Plan Básico</option>
              <option value="plan2">Plan Premium</option>
            </Field>
            <ErrorMessage name="planAsignadoId" component="div" className="text-red-400 text-xs" />
          </div>

          <div>
            <label htmlFor="notasInternas" className="block text-sm text-gray-200">Notas Internas</label>
            <Field as="textarea" name="notasInternas" className="input" />
          </div>

          <div>
            <label className="block text-sm text-gray-200 mb-1">Foto del cliente</label>
            <CameraUploader
              onUploadSuccess={(url) => setFieldValue("fotoUrl", url)}
            />
            {values.fotoUrl && (
              <img
                src={values.fotoUrl}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover rounded"
              />
            )}
            <ErrorMessage name="fotoUrl" component="div" className="text-red-400 text-xs" />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !dirty || !isValid}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
            >
              Guardar Cliente
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
            >
              Cancelar
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ClientCreateForm;
