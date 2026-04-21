const RESERVATION_SECONDS = 300; // 5 minutes

/** Calculate remaining seconds based on createdAt timestamp. */
export const calcRemaining = (createdAt: string): number => {
  const elapsed = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 1000,
  );
  return Math.max(0, RESERVATION_SECONDS - elapsed);
};

/** Format seconds as MM:SS */
export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};
