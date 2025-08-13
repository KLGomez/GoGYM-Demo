// src/utils/manualEntry.js
import { calculateMembershipDetails } from './membershipUtils';
import { showError, showSuccess } from './alerts';

export const processManualEntry = ({ identifier, clients, addAttendanceRecord }) => {
  const trimmed = identifier?.trim();
  if (!trimmed) {
    showError("Entrada Inválida", "Por favor, ingrese un código de cliente.");
    return null;
  }

  const foundClient = clients.find(c =>
    c.alphanumericCode === trimmed.toUpperCase() || c.dni === trimmed
  );

  if (!foundClient) {
    showError("Cliente No Encontrado", "No se encontró ningún cliente con ese código o DNI.");
    return null;
  }

  // Adaptar los datos para la función de membresía
  // Si el cliente tiene fechaInicioMembresia y fechaFinMembresia, calcular durationDays
  let startDate = foundClient.membership?.membershipStartDate || foundClient.fechaInicioMembresia;
  let durationDays = foundClient.membership?.membershipDurationDays;
  if (!durationDays && foundClient.fechaInicioMembresia && foundClient.fechaFinMembresia) {
    const inicio = new Date(foundClient.fechaInicioMembresia);
    const fin = new Date(foundClient.fechaFinMembresia);
    durationDays = Math.ceil((fin - inicio) / (1000 * 3600 * 24));
  }

  if (!foundClient) {
    showError("Cliente No Encontrado", "No se encontró ningún cliente con ese código o DNI.");
    return null;
  }

  const membershipInfo = calculateMembershipDetails(
    startDate,
    durationDays
  );

  const clientWithStatus = { ...foundClient, membershipStatusDetails: membershipInfo };

  // Usar los campos correctos para id y nombre
  const clientId = foundClient.id || foundClient._id;
  const clientName = `${foundClient.firstName || foundClient.nombre || ''} ${foundClient.lastName || foundClient.apellido || ''}`.trim();

  if (membershipInfo.status === "Active") {
    addAttendanceRecord({
      clientId,
      clientName,
      checkInTime: new Date().toISOString(),
      type: 'manual',
    });

    showSuccess("¡Acceso Concedido!", `${clientName}, ¡bienvenido/a! Membresía: ${membershipInfo.status}.`);
  } else {
    showError("Acceso Denegado", `Membresía ${membershipInfo.status}. ${clientName}, por favor, regulariza tu situación.`);
  }

  return clientWithStatus;
};
