export const calculateMembershipDetails = (startDate, durationDays) => {
  if (!startDate || typeof durationDays !== 'number' || isNaN(durationDays)) {
    // Return default/error state if inputs are invalid
    return {
      membershipEndDate: null,
      daysRemaining: 0,
      status: "Invalid Data",
    };
  }

  const start = new Date(startDate);
  if (isNaN(start.getTime())) { // Check if startDate was a valid date string
    return {
      membershipEndDate: null,
      daysRemaining: 0,
      status: "Invalid Start Date",
    };
  }

  const endDate = new Date(start);
  endDate.setDate(start.getDate() + durationDays);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfDayEndDate = new Date(endDate);
  endOfDayEndDate.setHours(23, 59, 59, 999);

  const timeDiff = endOfDayEndDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return {
    membershipEndDate: endDate.toISOString(),
    daysRemaining: daysRemaining < 0 ? 0 : daysRemaining,
    status: daysRemaining > 0 ? "Active" : "Expired",
  };
};
