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
 * Muestra una alerta de éxito.
 * @param {string} title - El título de la alerta.
 * @param {string} text - El texto del cuerpo de la alerta.
 */
export const showSuccess = (title, text) => {
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
 * Muestra una alerta de error.
 * @param {string} title - El título de la alerta.
 * @param {string} text - El texto del cuerpo de la alerta.
 */
export const showError = (title, text) => {
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
 * Muestra un modal de confirmación.
 * @param {string} title - El título del modal.
 * @param {string} text - El texto del cuerpo del modal.
 * @param {string} confirmButtonText - El texto para el botón de confirmación.
 * @param {function} callback - La función a ejecutar si el usuario confirma.
 */
export const confirmAction = (title, text, confirmButtonText = 'Sí, continuar', callback) => {
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
