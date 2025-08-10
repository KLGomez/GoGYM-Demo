export const calculateMembershipDetails = (startDate, durationDays) => {
  if (!startDate || !durationDays) {
    return {
      status: "Sin datos",
      endDate: null,
      remainingDays: null,
    };
  }

  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + durationDays);
  const today = new Date();

  const isActive = today <= end;
  const remainingTime = end - today;
  const remainingDays = isActive ? Math.ceil(remainingTime / (1000 * 60 * 60 * 24)) : 0;

  return {
    status: isActive ? "Activa" : "Vencida",
    endDate: end.toISOString(),
    remainingDays,
  };
};
