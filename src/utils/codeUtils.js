/**
 * Genera un código alfanumérico aleatorio de una longitud específica.
 * Los caracteres se eligen de A-Z, a-z, 0-9.
 * @param {number} length - La longitud deseada del código (por defecto 8).
 * @returns {string} El código alfanumérico generado.
 */
export const generateAlphanumericCode = (length = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * (Opcional) Una función más robusta podría intentar asegurar unicidad
 * si se le pasa una lista de códigos existentes, pero para LocalStorage
 * y un número moderado de clientes, la probabilidad de colisión con 8 caracteres
 * es baja. Para sistemas más grandes, se necesitaría una estrategia diferente.
 */
