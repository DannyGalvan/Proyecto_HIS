/**
 * Returns true if the 30-minute window starting at slotStart overlaps with
 * any of the occupied slots (each also treated as a 30-minute window).
 */
export const isSlotOccupied = (
  slotStart: Date,
  occupiedSlots: string[],
): boolean => {
  const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
  return occupiedSlots.some((occupied) => {
    const occStart = new Date(occupied);
    const occEnd = new Date(occStart.getTime() + 30 * 60 * 1000);
    return slotStart < occEnd && slotEnd > occStart;
  });
};

/** Generate all 30-minute slots from 07:00 to 18:30 for the given date. */
export const generateSlots = (date: Date): Date[] => {
  const slots: Date[] = [];
  // Start at 07:00, end at 18:30 (last slot starts at 18:30)
  for (let hour = 7; hour <= 18; hour++) {
    const minutes = hour === 18 ? [0, 30] : [0, 30];
    for (const minute of minutes) {
      if (hour === 18 && minute > 30) break;
      const slot = new Date(date);
      slot.setHours(hour, minute, 0, 0);
      slots.push(slot);
    }
  }
  return slots;
};

/** Format a Date as "yyyy-MM-dd" for the API call. */
export const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Format a Date as "HH:MM" for display. */
export const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};
