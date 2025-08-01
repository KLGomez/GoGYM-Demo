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

  const membershipInfo = calculateMembershipDetails(
    foundClient.membership?.membershipStartDate,
    foundClient.membership?.membershipDurationDays
  );

  const clientWithStatus = { ...foundClient, membershipStatusDetails: membershipInfo };

  if (membershipInfo.status === "Active") {
    addAttendanceRecord({
      clientId: foundClient.id,
      clientName: `${foundClient.firstName} ${foundClient.lastName}`,
      checkInTime: new Date().toISOString(),
      type: 'manual',
    });

    showSuccess("¡Acceso Concedido!", `${foundClient.firstName} ${foundClient.lastName}, ¡bienvenido/a! Membresía: ${membershipInfo.status}.`);
  } else {
    showError("Acceso Denegado", `Membresía ${membershipInfo.status}. ${foundClient.firstName}, por favor, regulariza tu situación.`);
  }

  return clientWithStatus;
};
