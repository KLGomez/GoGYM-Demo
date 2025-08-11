import Swal from 'sweetalert2';

// Paleta de colores GoGym (Tailwind : HEX)
// Fondo panel: bg-black : #000000
// Texto general: text-white : #ffffff
// Color principal GoGym: text-orange-400 : #f6ad55 (Este es más amarillo que el naranja de los botones)
// Botones y cards: bg-orange-500 : #ed8936
// Hover: hover:bg-orange-600 : #dd6b20
// Fondo estructura gris oscuro: bg-gray-800/900 : #1f2937 (usado en el logout)
// Textos secundarios: text-gray-200/400

const goGymColors = {
  primary: '#ed8936', // Naranja para botones y elementos activos
  primaryHover: '#dd6b20',
  background: '#1f2937', // Gris oscuro para el fondo del modal
  text: '#ffffff', // Texto blanco
  cancelButton: '#6b7280', // Gris para el botón de cancelar
  iconInfo: '#3b82f6', // Azul para íconos de información (si es necesario)
  iconSuccess: '#22c55e', // Verde para íconos de éxito
  iconWarning: '#f6ad55', // Naranja/Amarillo para advertencias (como el text-orange-400)
  iconError: '#ef4444', // Rojo para errores
};


/**
 * Genera el mensaje de alerta según el contexto de la acción.
 * @param {string} actionType - Tipo de acción (ej: 'addClient', 'addMembership', 'addClass', 'errorLogin', etc.)
 * @param {object} data - Datos relevantes para el mensaje.
 * @returns {{title: string, text: string}}
 */
export function getAlertMessage(actionType, data = {}) {
  switch (actionType) {
    case 'addClient':
      return {
        title: 'Cliente agregado',
        text: `El cliente ${data.firstName || ''} ${data.lastName || ''} ha sido creado exitosamente.`
      };
    case 'updateClient':
      return {
        title: 'Cliente actualizado',
        text: `El cliente ${data.firstName || ''} ${data.lastName || ''} ha sido actualizado.`
      };
    case 'deleteClient':
      return {
        title: 'Cliente eliminado',
        text: `El cliente ${data.firstName || ''} ${data.lastName || ''} ha sido eliminado.`
      };
    case 'addMembership':
      return {
        title: 'Membresía creada',
        text: `El plan de membresía "${data.planName || data.name || ''}" ha sido creado.`
      };
    case 'updateMembership':
      return {
        title: 'Membresía actualizada',
        text: `El plan de membresía "${data.planName || data.name || ''}" ha sido actualizado.`
      };
    case 'deleteMembership':
      return {
        title: 'Membresía eliminada',
        text: `El plan de membresía "${data.planName || data.name || ''}" ha sido eliminado.`
      };
    case 'addClass':
      return {
        title: 'Clase creada',
        text: `La clase "${data.nombre || data.name || ''}" ha sido creada.`
      };
    case 'updateClass':
      return {
        title: 'Clase actualizada',
        text: `La clase "${data.nombre || data.name || ''}" ha sido actualizada.`
      };
    case 'deleteClass':
      return {
        title: 'Clase eliminada',
        text: `La clase "${data.nombre || data.name || ''}" ha sido eliminada.`
      };
    case 'addTeacher':
      return {
        title: 'Profesor agregado',
        text: `El profesor ${data.nombre || ''} ${data.apellido || ''} ha sido agregado.`
      };
    case 'updateTeacher':
      return {
        title: 'Profesor actualizado',
        text: `El profesor ${data.nombre || ''} ${data.apellido || ''} ha sido actualizado.`
      };
    case 'deleteTeacher':
      return {
        title: 'Profesor eliminado',
        text: `El profesor ${data.nombre || ''} ${data.apellido || ''} ha sido eliminado.`
      };
    case 'addArticle':
      return {
        title: 'Artículo creado',
        text: `El artículo "${data.title || ''}" ha sido creado.`
      };
    case 'updateArticle':
      return {
        title: 'Artículo actualizado',
        text: `El artículo "${data.title || ''}" ha sido actualizado.`
      };
    case 'deleteArticle':
      return {
        title: 'Artículo eliminado',
        text: `El artículo "${data.title || ''}" ha sido eliminado.`
      };
    case 'successLogin':
      return {
        title: 'Inicio de sesión exitoso',
        text: `Bienvenido/a ${data.firstName || data.email || ''}!`
      };
    case 'errorLogin':
      return {
        title: 'Error de inicio de sesión',
        text: 'Email o contraseña incorrectos.'
      };
    case 'logout':
      return {
        title: 'Sesión cerrada',
        text: `¡Hasta pronto, ${data.firstName || data.email || ''}!`
      };
    case 'addFeedback':
      return {
        title: 'Feedback enviado',
        text: `Gracias por tu feedback sobre "${data.className || ''}".`
      };
    case 'addEnrollment':
      return {
        title: 'Inscripción exitosa',
        text: `Inscripción exitosa a "${data.className || ''}".`
      };
    case 'cancelEnrollment':
      return {
        title: 'Inscripción cancelada',
        text: `Has cancelado tu inscripción a "${data.className || ''}".`
      };
    case 'error':
      return {
        title: 'Error',
        text: data.message || 'Ha ocurrido un error.'
      };
    case 'warning':
      return {
        title: 'Advertencia',
        text: data.message || 'Advertencia.'
      };
    default:
      return {
        title: data.title || 'Notificación',
        text: data.text || data.message || ''
      };
  }
}

/**
 * Muestra una alerta de éxito contextual.
 * @param {string} actionType - Tipo de acción.
 * @param {object} data - Datos relevantes.
 */
export const showSuccess = (actionType, data = {}) => {
  const { title, text } = getAlertMessage(actionType, data);
  Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: goGymColors.primary,
    background: goGymColors.background,
    color: goGymColors.text,
    iconColor: goGymColors.iconSuccess,
  });
};

/**
 * Muestra una alerta de error contextual.
 * @param {string} actionType - Tipo de acción.
 * @param {object} data - Datos relevantes.
 */
export const showError = (actionType, data = {}) => {
  const { title, text } = getAlertMessage(actionType, data);
  Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: goGymColors.primary,
    background: goGymColors.background,
    color: goGymColors.text,
    iconColor: goGymColors.iconError,
  });
};

/**
 * Muestra una alerta de advertencia contextual.
 * @param {string} actionType - Tipo de acción.
 * @param {object} data - Datos relevantes.
 */
export const showWarning = (actionType, data = {}) => {
  const { title, text } = getAlertMessage(actionType, data);
  Swal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonColor: goGymColors.primary,
    background: goGymColors.background,
    color: goGymColors.text,
    iconColor: goGymColors.iconWarning,
  });
};

/**
 * Muestra un modal de confirmación.
 * @param {string} title - El título del modal.
 * @param {string} text - El texto del cuerpo del modal.
 * @param {string} confirmButtonText - El texto para el botón de confirmación.
 * @param {function} callback - La función a ejecutar si el usuario confirma.
 */

/**
 * Muestra un modal de confirmación contextual.
 * @param {string} actionType - Tipo de acción (ej: 'deleteClient', 'deleteClass', etc.)
 * @param {object} data - Datos relevantes para el mensaje.
 * @param {string} confirmButtonText - Texto para el botón de confirmación.
 * @param {function} callback - Función a ejecutar si el usuario confirma.
 */
export const confirmAction = (actionType, data = {}, confirmButtonText = 'Sí, continuar', callback) => {
  const { title, text } = getAlertMessage(actionType, data);
  Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: goGymColors.primary,
    cancelButtonColor: goGymColors.cancelButton,
    confirmButtonText,
    cancelButtonText: 'Cancelar',
    background: goGymColors.background,
    color: goGymColors.text,
    iconColor: goGymColors.iconWarning,
  }).then((result) => {
    if (result.isConfirmed) {
      callback();
    }
  });
};
