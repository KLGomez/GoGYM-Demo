/**
 * Genera un código alfanumérico aleatorio de una longitud específica.
 * Los caracteres se eligen de A-Z, a-z, 0-9.
 * @param {number} length - La longitud deseada del código (por defecto 8).
 * @returns {string} El código alfanumérico generado.
 */
export const generateAlphanumericCode = (length = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Simplificado a mayúsculas y números para facilidad de ingreso manual
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * Genera un código basado en iniciales y DNI.
 * Ejemplo: Juan Perez, DNI 12345678 -> JP12345678
 * @param {string} firstName - Nombre del cliente.
 * @param {string} lastName - Apellido del cliente.
 * @param {string} dni - DNI del cliente.
 * @returns {string} El código generado, o un código aleatorio si faltan datos.
 */
export const generateClientCode = (firstName, lastName, dni) => {
  if (firstName && lastName && dni) {
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    const dniDigits = dni.replace(/\D/g, ''); // Tomar solo dígitos del DNI
    return `${firstInitial}${lastInitial}${dniDigits}`;
  }
  // Fallback a un código aleatorio si los datos no están completos
  return generateAlphanumericCode(10);
};

/**
 * (Opcional) Una función más robusta podría intentar asegurar unicidad
 * si se le pasa una lista de códigos existentes, pero para LocalStorage
 * y un número moderado de clientes, la probabilidad de colisión con 8 caracteres
 * es baja. Para sistemas más grandes, se necesitaría una estrategia diferente.
 */
