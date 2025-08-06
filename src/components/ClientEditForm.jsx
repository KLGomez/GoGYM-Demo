import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ClientEditForm = ({ initialValues, onSubmit }) => {
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

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md text-white">
      <h2 className="text-xl font-bold mb-4 text-orange-400">Editar Cliente</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={EditSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ isSubmitting, dirty, isValid }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre">Nombre</label>
                <Field name="nombre" type="text" className="input" />
                <ErrorMessage name="nombre" component="div" className="text-red-400 text-sm" />
              </div>
              <div>
                <label htmlFor="apellido">Apellido</label>
                <Field name="apellido" type="text" className="input" />
                <ErrorMessage name="apellido" component="div" className="text-red-400 text-sm" />
              </div>
              <div>
                <label htmlFor="dni">DNI</label>
                <Field name="dni" type="text" className="input" />
                <ErrorMessage name="dni" component="div" className="text-red-400 text-sm" />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <Field name="email" type="email" className="input" />
                <ErrorMessage name="email" component="div" className="text-red-400 text-sm" />
              </div>
              <div>
                <label htmlFor="telefono">Teléfono</label>
                <Field name="telefono" type="text" className="input" />
                <ErrorMessage name="telefono" component="div" className="text-red-400 text-sm" />
              </div>
              <div>
                <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                <Field name="fechaNacimiento" type="date" className="input" />
                <ErrorMessage name="fechaNacimiento" component="div" className="text-red-400 text-sm" />
              </div>
              <div>
                <label htmlFor="planAsignadoId">Plan</label>
                <Field name="planAsignadoId" as="select" className="input">
                  <option value="">Seleccionar plan</option>
                  <option value="basic">Básico</option>
                  <option value="premium">Premium</option>
                </Field>
                <ErrorMessage name="planAsignadoId" component="div" className="text-red-400 text-sm" />
              </div>
              <div>
                <label htmlFor="notasInternas">Notas Internas</label>
                <Field name="notasInternas" as="textarea" className="input" />
                <ErrorMessage name="notasInternas" component="div" className="text-red-400 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="activo">Activo</label>
                <Field name="activo" type="checkbox" className="form-checkbox" />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !dirty || !isValid}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
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
