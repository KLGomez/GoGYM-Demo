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
  console.log('[MEMBERSHIP][CALC] startDate:', start.toISOString());
  console.log('[MEMBERSHIP][CALC] durationDays:', durationDays);
  console.log('[MEMBERSHIP][CALC] endDate:', endDate.toISOString());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfDayEndDate = new Date(endDate);
  endOfDayEndDate.setHours(23, 59, 59, 999);

  const timeDiff = endOfDayEndDate.getTime() - today.getTime();
  console.log('[MEMBERSHIP][CALC] today:', today.toISOString());
  console.log('[MEMBERSHIP][CALC] endOfDayEndDate:', endOfDayEndDate.toISOString());
  console.log('[MEMBERSHIP][CALC] timeDiff (ms):', timeDiff);
  console.log('[MEMBERSHIP][CALC] timeDiff (days, ceil):', Math.ceil(timeDiff / (1000 * 3600 * 24)));
  console.log('[MEMBERSHIP][CALC] timeDiff (days, floor):', Math.floor(timeDiff / (1000 * 3600 * 24)));

  const daysRemainingRaw = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const daysRemaining = daysRemainingRaw - 1;
  console.log('[MEMBERSHIP][CALC] daysRemainingRaw (Math.ceil):', daysRemainingRaw);
  console.log('[MEMBERSHIP][CALC] daysRemaining (ajustado):', daysRemaining);
  return {
    membershipEndDate: endDate.toISOString(),
    daysRemaining: daysRemaining,
    status: daysRemaining > 0 ? "Active" : "Expired",
  };
};
